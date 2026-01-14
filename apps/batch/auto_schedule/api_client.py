"""
API Client for Weekly Report Backend

Handles authentication and API calls to the NestJS backend.
"""
import time
from typing import Any, Optional
import requests


class APIClient:
    """Client for interacting with the Weekly Report backend API."""

    def __init__(self, base_url: str, email: str, password: str):
        """
        Initialize API client.

        Args:
            base_url: Base URL of the API (e.g., http://localhost:4000/api/v1)
            email: User email for authentication
            password: User password for authentication
        """
        self.base_url = base_url.rstrip("/")
        self.email = email
        self.password = password
        self.session = requests.Session()
        self.token: Optional[str] = None

    def login(self) -> dict[str, Any]:
        """
        Login and obtain JWT token.

        Returns:
            Response with access_token and user info

        Raises:
            requests.HTTPError: If login fails
        """
        url = f"{self.base_url}/auth/login"
        payload = {"email": self.email, "password": self.password}

        print(f"[api] Logging in as {self.email}...")
        response = self.session.post(url, json=payload, timeout=10)
        response.raise_for_status()

        data = response.json()
        self.token = data.get("accessToken")  # camelCase!
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        print("[api] ✅ Login successful")
        return data

    def get_users(self) -> list[dict[str, Any]]:
        """
        Get all users.

        Returns:
            List of user objects with id, name, email, etc.
        """
        url = f"{self.base_url}/users"
        response = self.session.get(url, timeout=10)
        response.raise_for_status()
        users = response.json()
        print(f"[api] Retrieved {len(users)} users")
        return users

    def get_attendance_types(self) -> list[dict[str, Any]]:
        """
        Get all attendance types.

        Returns:
            List of attendance type objects with id, code, name, category
        """
        url = f"{self.base_url}/attendance-types"
        response = self.session.get(url, timeout=10)
        response.raise_for_status()
        types = response.json()
        print(f"[api] Retrieved {len(types)} attendance types")
        return types

    def get_attendances_in_range(
        self, start_date: str, end_date: str
    ) -> list[dict[str, Any]]:
        """
        Get all attendances in date range.

        Args:
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)

        Returns:
            List of attendance objects
        """
        url = f"{self.base_url}/attendances"
        params = {"startDate": start_date, "endDate": end_date}
        response = self.session.get(url, params=params, timeout=10)
        response.raise_for_status()
        attendances = response.json()
        return attendances

    def delete_attendance(self, attendance_id: str) -> None:
        """
        Delete a single attendance.

        Args:
            attendance_id: UUID of the attendance to delete
        """
        url = f"{self.base_url}/attendances/{attendance_id}"
        response = self.session.delete(url, timeout=10)
        response.raise_for_status()

    def delete_attendances_in_range(self, start_date: str, end_date: str) -> int:
        """
        Delete all attendances in date range.

        Args:
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)

        Returns:
            Number of attendances deleted
        """
        print(f"[api] Fetching attendances from {start_date} to {end_date}...")
        attendances = self.get_attendances_in_range(start_date, end_date)
        count = len(attendances)

        if count == 0:
            print("[api] No existing attendances to delete")
            return 0

        print(f"[api] Deleting {count} existing attendances...")
        for i, attendance in enumerate(attendances, 1):
            try:
                self.delete_attendance(attendance["id"])
                if i % 10 == 0:
                    print(f"[api]   Deleted {i}/{count}...")
            except Exception as e:
                print(f"[api]   ⚠️  Failed to delete {attendance['id']}: {e}")

        print(f"[api] ✅ Deleted {count} attendances")
        return count

    def create_attendance(self, payload: dict[str, Any]) -> dict[str, Any]:
        """
        Create a new attendance.

        Args:
            payload: Attendance data (userId, typeId, startDate, endDate, etc.)

        Returns:
            Created attendance object

        Raises:
            requests.HTTPError: If creation fails
        """
        url = f"{self.base_url}/attendances"
        response = self.session.post(url, json=payload, timeout=10)
        response.raise_for_status()
        return response.json()

    def create_attendance_with_retry(
        self, payload: dict[str, Any], max_retries: int = 3
    ) -> Optional[dict[str, Any]]:
        """
        Create attendance with retry logic.

        Args:
            payload: Attendance data
            max_retries: Maximum number of retry attempts

        Returns:
            Created attendance object, or None if all retries failed
        """
        for attempt in range(max_retries):
            try:
                result = self.create_attendance(payload)
                time.sleep(0.1)  # Rate limiting
                return result
            except requests.HTTPError as e:
                if e.response.status_code == 429:  # Too Many Requests
                    wait = 2**attempt
                    print(f"[api]   Rate limited, waiting {wait}s...")
                    time.sleep(wait)
                    continue
                elif attempt < max_retries - 1:
                    print(f"[api]   ⚠️  Attempt {attempt + 1} failed, retrying...")
                    time.sleep(1)
                    continue
                else:
                    print(f"[api]   ❌ Failed after {max_retries} attempts: {e}")
                    return None
            except Exception as e:
                print(f"[api]   ❌ Unexpected error: {e}")
                return None
        return None
