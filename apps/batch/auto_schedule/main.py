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
from api_client import APIClient

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
        # API 설정
        "api_base_url": _required(parser, "api", "base_url"),
        "api_email": _required(parser, "api", "email"),
        "api_password": _required(parser, "api", "password"),
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
    """이번주 월요일부터 다음주 일요일까지 반환"""
    today = datetime.now()
    # 이번주 월요일 (weekday: 월=0, 화=1, ... 일=6)
    this_monday = today - timedelta(days=today.weekday())
    # 다음주 일요일 (이번주 월요일 + 13일)
    next_sunday = this_monday + timedelta(days=13)
    return (
        this_monday.strftime("%Y-%m-%d 00:00"),
        next_sunday.strftime("%Y-%m-%d 23:59"),
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
    """대괄호로 시작하는 일정만 필터링 (휴가, 출장 등), 교육 제외"""
    results = []
    for member in schedule_data:
        for event in member.get("scheduleViewList", []):
            summary = event.get("summary", "")
            # 대괄호로 시작하고, 교육이 아닌 것만
            if summary.startswith("[") and not summary.startswith("[교육]"):
                results.append({
                    "memberId": member.get("memberId"),
                    "summary": summary,
                    "startDate": event.get("startDate"),
                    "endDate": event.get("endDate"),
                    "scheduleType": event.get("scheduleType"),
                })
    return results


def _parse_schedule_type(summary: str) -> str:
    """일정 제목에서 타입 추출 (예: [휴가], [출장])"""
    if not summary.startswith("["):
        return ""
    try:
        return summary.split("]")[0][1:]  # [휴가] -> 휴가
    except IndexError:
        return ""


def _parse_user_name(summary: str) -> str:
    """일정 제목에서 사용자 이름 추출 (예: [휴가]-손병진 -> 손병진)"""
    # 패턴: [타입]내용-이름 또는 [타입]-이름
    if "-" not in summary:
        return ""
    # 마지막 - 뒤의 텍스트가 이름
    return summary.split("-")[-1].strip()


def _parse_schedule_content(summary: str) -> str:
    """일정 제목에서 내용 추출 (예: [출장]스틸샵 시스템 업무 협의-이경봉 -> 스틸샵 시스템 업무 협의)"""
    # 패턴: [타입]내용-이름
    if "]" not in summary or "-" not in summary:
        return ""
    
    # ] 다음부터 마지막 - 전까지 추출
    try:
        after_bracket = summary.split("]", 1)[1]  # [출장]스틸샵... -> 스틸샵...
        # 마지막 - 앞까지가 내용
        parts = after_bracket.rsplit("-", 1)  # 마지막 -로 split
        if len(parts) == 2:
            content = parts[0].strip()
            return content if content else ""
    except (IndexError, AttributeError):
        pass
    
    return ""


def _extract_date_only(datetime_str: str) -> str:
    """날짜/시간 문자열에서 날짜만 추출 (YYYY-MM-DD)"""
    # "2025-11-13 13:00" -> "2025-11-13"
    return datetime_str.split()[0] if " " in datetime_str else datetime_str


def _map_type_to_attendance_type(schedule_type: str, attendance_types: list) -> str | None:
    """일정 타입을 AttendanceType code로 매핑"""
    # 휴가 계열 -> ANNUAL
    if schedule_type in ["휴가", "반차", "반반차"]:
        for t in attendance_types:
            if t["code"] == "ANNUAL":
                return t["id"]
    # 출장/외근 -> BUSINESS_TRIP
    elif schedule_type in ["출장", "외근"]:
        for t in attendance_types:
            if t["code"] == "BUSINESS_TRIP":
                return t["id"]
    return None


def _create_attendance_payload(
    user_id: str,
    type_id: str,
    start_date: str,
    end_date: str,
    content: str | None = None,
) -> dict:
    """Attendance 생성 API 페이로드 생성"""
    return {
        "userId": user_id,
        "typeId": type_id,
        "startDate": _extract_date_only(start_date),
        "endDate": _extract_date_only(end_date),
        "content": content,
    }


def _register_attendances(
    filtered_schedules: list,
    api_client: APIClient,
    start_date: str,
    end_date: str,
) -> dict:
    """
    필터링된 일정을 백엔드 API로 등록.
    
    1. 먼저 해당 기간의 모든 Attendance 삭제
    2. 새로운 일정을 등록
    
    Returns:
        통계 정보 (deleted, success, failed, skipped)
    """
    print("\n" + "=" * 60)
    print("[registration] Starting attendance registration...")
    print("=" * 60)
    
    # 1. 기간별 일괄 삭제
    try:
        deleted_count = api_client.delete_attendances_in_range(start_date, end_date)
    except Exception as e:
        print(f"[registration] ⚠️  Failed to delete existing attendances: {e}")
        deleted_count = 0
    
    # 2. 사용자 및 타입 정보 조회
    print("\n[registration] Fetching users and attendance types...")
    try:
        users = api_client.get_users()
        attendance_types = api_client.get_attendance_types()
    except Exception as e:
        print(f"[registration] ❌ Failed to fetch metadata: {e}")
        return {"deleted": deleted_count, "success": 0, "failed": 0, "skipped": 0}
    
    # 사용자명 -> userId 매핑
    user_map = {user["name"]: user["id"] for user in users}
    print(f"[registration] User mapping: {len(user_map)} users")
    
    # 3. 일정 등록
    stats = {"deleted": deleted_count, "success": 0, "failed": 0, "skipped": 0}
    print(f"\n[registration] Registering {len(filtered_schedules)} schedules...")
    
    for i, schedule in enumerate(filtered_schedules, 1):
        summary = schedule["summary"]
        start_date_str = schedule["startDate"]
        end_date_str = schedule["endDate"]
        
        # 파싱
        schedule_type = _parse_schedule_type(summary)
        user_name = _parse_user_name(summary)
        schedule_content = _parse_schedule_content(summary)  # 출장 내용, 휴가 세부사항 등
        
        # 사용자 매칭
        user_id = user_map.get(user_name)
        if not user_id:
            print(f"[{i}/{len(filtered_schedules)}] ⚠️  User not found: {user_name} ({summary})")
            stats["skipped"] += 1
            continue
        
        # 타입 매핑
        type_id = _map_type_to_attendance_type(schedule_type, attendance_types)
        if not type_id:
            print(f"[{i}/{len(filtered_schedules)}] ⚠️  Unknown type: {schedule_type} ({summary})")
            stats["skipped"] += 1
            continue
        
        # content: 일정 내용만 (출장 목적, 휴가 세부사항 등)
        content = schedule_content if schedule_content else None
        
        # 페이로드 생성
        payload = _create_attendance_payload(
            user_id, type_id, start_date_str, end_date_str, content
        )
        
        # API 호출
        result = api_client.create_attendance_with_retry(payload)
        if result:
            if i % 10 == 0 or i == len(filtered_schedules):
                print(f"[{i}/{len(filtered_schedules)}] ✅ {user_name}: {schedule_type} ({start_date_str} ~ {end_date_str})")
            stats["success"] += 1
        else:
            print(f"[{i}/{len(filtered_schedules)}] ❌ Failed: {summary}")
            stats["failed"] += 1
    
    # 최종 통계
    print("\n" + "=" * 60)
    print("[registration] Registration complete!")
    print(f"  Deleted:  {stats['deleted']} existing attendances")
    print(f"  Success:  {stats['success']} attendances created")
    print(f"  Failed:   {stats['failed']} attendances")
    print(f"  Skipped:  {stats['skipped']} attendances (user/type not found)")
    print("=" * 60)
    
    return stats


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
        chrome_options.add_argument("--disable-dev-shm-usage")
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

    # calendar.worksmobile.com 페이지 로드 대기 (팝업 처리 포함)
    def wait_for_calendar_page(driver):
        """팝업이나 다중 윈도우를 처리하며 calendar 페이지를 찾음"""
        end_time = time.time() + 30
        while time.time() < end_time:
            try:
                # 현재 윈도우에서 URL 확인
                if "calendar.worksmobile.com" in driver.current_url:
                    return True
            except Exception:
                # 현재 윈도우가 닫혔거나 접근 불가
                pass

            # 모든 열린 윈도우를 확인
            try:
                handles = driver.window_handles
                for handle in handles:
                    try:
                        driver.switch_to.window(handle)
                        if "calendar.worksmobile.com" in driver.current_url:
                            print(f"[calendar] calendar 페이지 발견 (윈도우 전환)")
                            return True
                    except Exception:
                        # 이 윈도우는 접근 불가, 다음 윈도우 확인
                        continue
            except Exception:
                pass

            time.sleep(0.5)

        raise TimeoutError("calendar.worksmobile.com 페이지를 찾을 수 없습니다")

    wait_for_calendar_page(iris_driver)
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
        
        # API 클라이언트 초기화 및 등록
        if filtered:
            print("\n[api] Initializing API client...")
            try:
                api_client = APIClient(
                    settings["api_base_url"],
                    settings["api_email"],
                    settings["api_password"],
                )
                api_client.login()
                
                # 조회 기간 가져오기
                view_from, view_until = _get_date_range()
                start_date = view_from.split()[0]  # "YYYY-MM-DD HH:MM" -> "YYYY-MM-DD"
                end_date = view_until.split()[0]
                
                # 등록 실행
                _register_attendances(filtered, api_client, start_date, end_date)
            except Exception as e:
                print(f"\n[api] ❌ API registration failed: {e}")
                import traceback
                traceback.print_exc()
        else:
            print("\n[calendar] No schedules to register")
            
    except Exception as e:
        print(f"[calendar] 조회 실패: {e}")


if __name__ == "__main__":
    main()
