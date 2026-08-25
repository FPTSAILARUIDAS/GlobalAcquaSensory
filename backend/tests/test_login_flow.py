"""Login flow tests: valid/invalid creds + authenticated admin endpoint regression."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://sensory-dashboard-1.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def test_admin_login_success(session):
    r = session.post(f"{BASE_URL}/api/auth/login", json={"username": "customadmin", "password": "admin"}, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "access_token" in data and isinstance(data["access_token"], str) and len(data["access_token"]) > 10
    assert data.get("role") == "admin"
    assert data.get("username") == "customadmin"


def test_panelist_login_success(session):
    r = session.post(f"{BASE_URL}/api/auth/login", json={"username": "testpanelist", "password": "test123"}, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "access_token" in data
    assert data.get("role") == "user"
    assert data.get("username") == "testpanelist"


def test_login_wrong_password(session):
    r = session.post(f"{BASE_URL}/api/auth/login", json={"username": "customadmin", "password": "wrongpass"}, timeout=30)
    assert r.status_code == 401
    data = r.json()
    assert data.get("detail") == "Incorrect username or password"


def test_login_unknown_user(session):
    r = session.post(f"{BASE_URL}/api/auth/login", json={"username": "nosuchuser_xyz", "password": "whatever"}, timeout=30)
    assert r.status_code == 401
    assert r.json().get("detail") == "Incorrect username or password"


def test_admin_daily_summary_regression(session):
    # Login as admin then call daily-summary/2026-06-18 expecting 24 sessions
    r = session.post(f"{BASE_URL}/api/auth/login", json={"username": "customadmin", "password": "admin"}, timeout=30)
    assert r.status_code == 200
    token = r.json()["access_token"]

    r2 = session.get(f"{BASE_URL}/api/admin/daily-summary/2026-06-18",
                     headers={"Authorization": f"Bearer {token}"}, timeout=30)
    assert r2.status_code == 200, r2.text
    data = r2.json()
    # Response could be a list or object with sessions
    sessions_list = data if isinstance(data, list) else data.get("sessions", [])
    print(f"daily-summary returned {len(sessions_list)} sessions")
    # Regression: auth token works and endpoint returns sessions for the date
    assert len(sessions_list) >= 20, f"Expected >=20 sessions, got {len(sessions_list)}"
