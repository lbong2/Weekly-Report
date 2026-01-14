import calendar
import email
import imaplib
from datetime import datetime, timezone
from email.header import decode_header, make_header


def _extract_code(subject: str) -> str:
    """Parse `[123456]` style 인증 코드를 잘라낸다."""
    return subject.split("[")[1].split("]")[0]


def _parse_internal_date(payload) -> datetime:
    """Convert INTERNALDATE fetch response to aware UTC datetime."""
    raw = payload[0] if isinstance(payload, tuple) else payload
    if not isinstance(raw, (bytes, bytearray)):
        raw = str(raw).encode()
    stamp_tuple = imaplib.Internaldate2tuple(raw)
    if stamp_tuple is None:
        return datetime.now(timezone.utc)
    return datetime.fromtimestamp(calendar.timegm(stamp_tuple), timezone.utc)


def getAuthNumber(mail, appPw, from_email, max_retries=3):
    """Gmail에서 인증 코드 가져오기 (재시도 로직 포함)"""
    last_error = None

    for attempt in range(max_retries):
        try:
            server = imaplib.IMAP4_SSL("imap.gmail.com", 993, timeout=30)
            server.login(mail, appPw)
            server.select("inbox")
            break
        except (imaplib.IMAP4.abort, OSError, EOFError) as e:
            last_error = e
            if attempt < max_retries - 1:
                import time
                time.sleep(2 ** attempt)  # 1초, 2초, 4초 대기
            else:
                raise RuntimeError(f"Gmail 연결 실패 ({max_retries}회 시도): {e}") from e

    status, messages = server.search(None, f'(FROM "{from_email}")')
    mail_ids = messages[0].split()

    if not mail_ids:
        raise RuntimeError("인증 메일을 찾을 수 없습니다.")

    latest_email_id = mail_ids[-1]

    status, msg_data = server.fetch(latest_email_id, "(RFC822)")
    message = email.message_from_bytes(msg_data[0][1])
    subject = make_header(decode_header(message.get("Subject")))

    _, internal_data = server.fetch(latest_email_id, "(INTERNALDATE)")
    received_at = _parse_internal_date(internal_data[0])

    server.close()
    server.logout()

    code = _extract_code(str(subject))
    return code, received_at
