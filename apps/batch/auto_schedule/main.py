import configparser
import os
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

import auth

CONFIG_FILENAME = os.getenv("AUTO_LOGIN_CONFIG", "config.ini")


def _base_dir() -> Path:
    if getattr(sys, "frozen", False):
        return Path(sys.executable).parent
    return Path(__file__).resolve().parent


def _config_path() -> Path:
    return _base_dir() / CONFIG_FILENAME


def _required(config: configparser.ConfigParser, section: str, option: str) -> str:
    try:
        value = config.get(section, option).strip()
    except (configparser.NoSectionError, configparser.NoOptionError) as exc:
        raise RuntimeError(f"[{section}] {option} 설정을 찾을 수 없습니다.") from exc
    if not value:
        raise RuntimeError(f"[{section}] {option} 값이 비어 있습니다.")
    return value


def _load_settings() -> dict:
    config_path = _config_path()
    parser = configparser.ConfigParser()
    read_files = parser.read(config_path, encoding="utf-8")
    if not read_files:
        raise FileNotFoundError(f"설정 파일을 찾을 수 없습니다: {config_path}")

    return {
        "config_path": config_path,
        "iris_id": _required(parser, "iris", "id"),
        "iris_password": _required(parser, "iris", "password"),
        "auth_email": _required(parser, "auth", "email"),
        "auth_app_password": _required(parser, "auth", "app_password"),
        "auth_from_email": parser.get("auth", "from_email", fallback="no_reply@worksmobile.com").strip()
        or "no_reply@worksmobile.com",
        "auth_initial_delay": parser.getint("auth", "initial_delay", fallback=5),
        "auth_poll_delay": parser.getint("auth", "poll_delay", fallback=5),
        "auth_poll_retries": parser.getint("auth", "poll_retries", fallback=12),
        "headless": parser.getboolean("selenium", "headless", fallback=False),
    }


def _fetch_auth_code(
    email: str,
    app_password: str,
    from_email: str,
    not_before: datetime,
    initial_delay: int,
    retries: int,
    delay: int,
) -> str:
    """Poll Gmail until a mail newer than `not_before` arrives."""
    last_error: Exception | None = None
    print(
        f"[auth] 새 인증 메일 대기 시작 "
        f"(초기 대기 {initial_delay}s, 재시도 {retries}회, 간격 {delay}s)"
    )
    time.sleep(initial_delay)
    for attempt in range(retries):
        try:
            code, received_at = auth.getAuthNumber(email, app_password, from_email)
            received_at_utc = received_at.astimezone(timezone.utc)
            if received_at_utc >= not_before:
                print(f"[auth] 새 메일 감지 ({received_at_utc.isoformat()})")
                return code
            print(
                f"[auth] 이전 코드 무시 ({received_at_utc.isoformat()} < {not_before.isoformat()}) "
                f"- 재시도 {attempt + 1}/{retries}"
            )
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            print(f"[auth] 메일 확인 실패({attempt + 1}/{retries}): {exc}")
        if attempt < retries - 1:
            time.sleep(delay)
    if last_error:
        raise RuntimeError("새로운 2차 인증 메일을 확인하지 못했습니다.") from last_error
    raise RuntimeError("새로운 2차 인증 메일을 확인하지 못했습니다.")


def _get_date_range() -> tuple[str, str]:
    """오늘부터 다음달 말일까지 반환"""
    today = datetime.now()
    # 다음달 말일 계산: 2달 후 1일에서 하루 빼기
    if today.month == 11:
        next_next_month = today.replace(year=today.year + 1, month=1, day=1)
    elif today.month == 12:
        next_next_month = today.replace(year=today.year + 1, month=2, day=1)
    else:
        next_next_month = today.replace(month=today.month + 2, day=1)
    end_of_next_month = next_next_month - timedelta(days=1)
    return (
        today.strftime("%Y-%m-%d 00:00"),
        end_of_next_month.strftime("%Y-%m-%d 23:59"),
    )


def _create_calendar_session(driver: webdriver.Chrome) -> requests.Session:
    """Selenium 쿠키로 requests 세션 생성"""
    session = requests.Session()
    for cookie in driver.get_cookies():
        session.cookies.set(cookie["name"], cookie["value"], domain=cookie.get("domain", ""))
    return session


def _get_calendar_headers() -> dict:
    """캘린더 API 공통 헤더"""
    return {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json",
        "origin": "https://calendar.worksmobile.com",
        "referer": "https://calendar.worksmobile.com/web/calendar/main",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
    }


def _fetch_member_list(session: requests.Session) -> list:
    """팀원 목록 동적 조회"""
    url = "https://calendar.worksmobile.com/api/individualUserList"
    payload = {
        "memberList": [],
        "includeSubMember": False,
        "includeDefaultGroup": True,
        "includeDomainCalendar": False,
    }
    response = session.post(url, headers=_get_calendar_headers(), json=payload)
    response.raise_for_status()
    data = response.json()
    return data.get("userInfoList", [])


def _fetch_team_schedule(driver: webdriver.Chrome) -> list:
    """Selenium 쿠키로 캘린더 일정 조회"""
    session = _create_calendar_session(driver)

    # 1. 팀원 목록 동적 조회
    member_list = _fetch_member_list(session)
    print(f"[calendar] 팀원 {len(member_list)}명 조회 완료")

    # 2. 일정 조회
    view_from, view_until = _get_date_range()
    url = "https://calendar.worksmobile.com/api/memberScheduleViewList"
    params = {"viewFrom": view_from, "viewUntil": view_until, "rl": "24101"}
    payload = {"memberList": member_list}

    response = session.post(url, params=params, headers=_get_calendar_headers(), json=payload)
    response.raise_for_status()
    return response.json()


def _filter_bracket_schedules(schedule_data: list) -> list:
    """대괄호로 시작하는 일정만 필터링 (휴가, 출장 등)"""
    results = []
    for member in schedule_data:
        for event in member.get("scheduleViewList", []):
            summary = event.get("summary", "")
            if summary.startswith("["):
                results.append({
                    "memberId": member.get("memberId"),
                    "summary": summary,
                    "startDate": event.get("startDate"),
                    "endDate": event.get("endDate"),
                    "scheduleType": event.get("scheduleType"),
                })
    return results


def _input_credentials(driver: webdriver.Chrome, wait: WebDriverWait, settings: dict) -> None:
    """Handle overlay inputs (#idtemp/#passwordtemp) and type into real fields."""
    user_id_overlay = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "#idtemp")))
    user_id_overlay.click()
    user_id = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "#id")))
    user_id.clear()
    user_id.send_keys(settings["iris_id"])

    pw_overlay = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "#passwordtemp")))
    pw_overlay.click()
    pw = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "#password")))
    pw.clear()
    pw.send_keys(settings["iris_password"])


def main() -> None:
    settings = _load_settings()
    print(f"[config] 설정 파일 로드: {settings['config_path']}")

    chrome_options = Options()
    chrome_options.add_experimental_option("detach", not settings["headless"])
    if settings["headless"]:
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
    print(f"[iris] 브라우저 옵션 설정 완료 (headless={settings['headless']})")

    iris_driver = webdriver.Chrome(options=chrome_options)
    wait = WebDriverWait(iris_driver, 15)
    print("[iris] WebDriver 초기화 완료")

    iris_driver.get("https://iris.dongkuk.com/")
    print("[iris] IRIS 로그인 페이지 접속")

    _input_credentials(iris_driver, wait, settings)
    print("[iris] 사용자 아이디/비밀번호 입력 완료")

    login_bt = wait.until(
        EC.element_to_be_clickable(
            (By.CSS_SELECTOR, "#frm > section > section > article.loginBox > div > div:nth-child(4) > a")
        )
    )
    login_bt.click()
    print("[iris] 로그인 버튼 클릭")

    auth_bt = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "#privateEmailButton")))
    auth_bt.click()
    print("[iris] 2차 인증 메일 요청 완료")

    request_timestamp = datetime.now(timezone.utc)
    auth_num = _fetch_auth_code(
        settings["auth_email"],
        settings["auth_app_password"],
        settings["auth_from_email"],
        not_before=request_timestamp,
        initial_delay=settings["auth_initial_delay"],
        retries=settings["auth_poll_retries"],
        delay=settings["auth_poll_delay"],
    )

    pw2 = WebDriverWait(iris_driver, 30).until(EC.element_to_be_clickable((By.CSS_SELECTOR, "#number1")))
    pw2.clear()
    pw2.send_keys(auth_num)
    print("[iris] 2차 인증번호 입력 완료")
    print("[iris] 자동 로그인 절차 완료")

    # 일정 메뉴 클릭하여 calendar.worksmobile.com SSO 세션 획득
    print("\n[calendar] 일정 메뉴 클릭하여 SSO 세션 획득 중...")
    schedule_menu = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, 'li[data-menu-alias="Schedule"] a'))
    )
    original_window = iris_driver.current_window_handle
    schedule_menu.click()
    print("[calendar] 일정 메뉴 클릭 완료")

    # 새 탭이 열리면 전환
    WebDriverWait(iris_driver, 10).until(lambda d: len(d.window_handles) > 1)
    for handle in iris_driver.window_handles:
        if handle != original_window:
            iris_driver.switch_to.window(handle)
            break
    print("[calendar] 새 탭으로 전환 완료")

    # calendar.worksmobile.com 페이지 로드 대기
    WebDriverWait(iris_driver, 30).until(
        lambda d: "calendar.worksmobile.com" in d.current_url
    )
    print(f"[calendar] 캘린더 페이지 로드 완료: {iris_driver.current_url}")

    # 캘린더 일정 조회
    print("\n[calendar] 팀원 일정 조회 중...")
    try:
        schedule = _fetch_team_schedule(iris_driver)
        filtered = _filter_bracket_schedules(schedule)
        print(f"[calendar] 조회 완료 (휴가/출장 등 {len(filtered)}건)")
        print("=" * 60)
        for item in filtered:
            print(f"  {item['summary']} | {item['startDate']} ~ {item['endDate']}")
        print("=" * 60)
    except Exception as e:
        print(f"[calendar] 조회 실패: {e}")


if __name__ == "__main__":
    main()
