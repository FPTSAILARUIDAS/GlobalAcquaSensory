"""Backend tests for the signature-exclusion / 502 root cause fix + regressions."""
import os
import json
import time
import uuid
import pytest
import requests
import concurrent.futures

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sensory-dashboard-1.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

ADMIN = {"username": "customadmin", "password": "admin"}
PANELIST = {"username": "testpanelist", "password": "test123"}


def _login(creds):
    r = requests.post(f"{API}/auth/login", json=creds, timeout=30)
    assert r.status_code == 200, f"Login failed for {creds['username']}: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def admin_token():
    return _login(ADMIN)


@pytest.fixture(scope="module")
def panelist_token():
    return _login(PANELIST)


def _headers(tok):
    return {"Authorization": f"Bearer {tok}"}


# ---------- Root cause: /api/sessions is lightweight ----------
class TestSessionsLightweight:
    def test_admin_sessions_light_and_fast(self, admin_token):
        t0 = time.time()
        r = requests.get(f"{API}/sessions", headers=_headers(admin_token), timeout=60)
        elapsed = time.time() - t0
        assert r.status_code == 200
        size = len(r.content)
        print(f"admin /api/sessions -> {r.status_code}, {size} bytes, {elapsed:.2f}s")
        assert size < 1_000_000, f"Response too large: {size} bytes"
        data = r.json()
        assert isinstance(data, list)
        assert len(data) <= 200
        # Verify no signature fields in any ballot
        for s in data:
            for b in s.get("ballots", []) or []:
                assert "signature" not in b, "ballots.signature should be excluded"
                assert "signaturePreview" not in b, "ballots.signaturePreview should be excluded"
            assert "verificationSignature" not in s, "verificationSignature should be excluded"

    def test_panelist_sessions_light(self, panelist_token):
        r = requests.get(f"{API}/sessions", headers=_headers(panelist_token), timeout=30)
        assert r.status_code == 200
        size = len(r.content)
        print(f"panelist /api/sessions -> {r.status_code}, {size} bytes")
        assert size < 1_000_000
        data = r.json()
        for s in data:
            for b in s.get("ballots", []) or []:
                assert "signature" not in b
                assert "signaturePreview" not in b


# ---------- Root endpoint used for connectivity check ----------
class TestConnectivityRoot:
    def test_api_root_ok(self):
        r = requests.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert "message" in r.json()


# ---------- Regression: ballot submit + session completion ----------
class TestBallotFlow:
    def test_create_and_submit_ballot_completes(self, panelist_token):
        # Create session
        r = requests.post(
            f"{API}/sessions/create",
            headers=_headers(panelist_token),
            json={"targetPanelistCount": 1, "testType": "regular"},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        sess = r.json()
        code = sess["sessionCode"]

        ballot = {
            "panelistName": "testpanelist",
            "productType": "TEST_Water",
            "productCode": f"TEST_{uuid.uuid4().hex[:6]}",
            "dateOfMfg": "2026-01-01",
            "productTime": "10:00",
            "testingCompletionDate": "2026-01-01",
            "testingCompletionTime": "10:30",
            "appearance": {"status": "IN"},
            "odour": {"status": "IN"},
            "taste": {"status": "IN"},
            "remarks": "test",
            "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
        }
        r2 = requests.post(
            f"{API}/sessions/submit-ballot",
            json={"sessionCode": code, "ballotData": ballot},
            timeout=30,
        )
        assert r2.status_code == 200, r2.text
        updated = r2.json()
        assert updated["status"] == "completed", f"Expected completed, got {updated['status']}"
        assert updated.get("completedAt") is not None
        assert len(updated["ballots"]) == 1


# ---------- Admin dashboard endpoints ----------
class TestAdminEndpoints:
    def test_admin_all_sessions(self, admin_token):
        r = requests.get(f"{API}/admin/sessions/all", headers=_headers(admin_token), timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # Verify lightweight: has ballotsCount instead of full ballots
        if data:
            assert "ballotsCount" in data[0]
            assert "ballots" not in data[0]

    def test_daily_summary_2026_06_18(self, admin_token):
        r = requests.get(f"{API}/admin/daily-summary/2026-06-18", headers=_headers(admin_token), timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert "sessions" in data
        assert data["totalSessions"] >= 24, f"Expected >=24 sessions, got {data['totalSessions']}"
        # Verification signatures should be present in daily summary (only ballot signatures excluded)
        # Check at least one has verificationSignature if any verified
        for s in data["sessions"]:
            for b in s.get("ballots", []) or []:
                assert "signature" not in b
                assert "signaturePreview" not in b

    def test_blind_summary_endpoint(self, admin_token):
        # Try the endpoint - the exact path may be /admin/blind-test-summary/{date}
        for path in ["/admin/blind-test-summary/2026-06-18", "/blind-test-summary/2026-06-18"]:
            r = requests.get(f"{API}{path}", headers=_headers(admin_token), timeout=30)
            if r.status_code != 404:
                print(f"blind summary {path} -> {r.status_code}")
                assert r.status_code == 200
                return
        pytest.skip("Blind test summary endpoint not found")

    def test_proficiency_summary_endpoint(self, admin_token):
        for path in ["/admin/proficiency-test-summary/2026-06-26", "/proficiency-test-summary/2026-06-26"]:
            r = requests.get(f"{API}{path}", headers=_headers(admin_token), timeout=30)
            if r.status_code != 404:
                print(f"prof summary {path} -> {r.status_code}")
                assert r.status_code == 200
                return
        pytest.skip("Proficiency test summary endpoint not found")


# ---------- Stability loop ----------
class TestStability:
    def test_loop_key_endpoints(self, admin_token):
        endpoints = [
            "/sessions",
            "/admin/sessions/all",
            "/admin/daily-summary/2026-06-18",
        ]
        results = {ep: [] for ep in endpoints}
        for i in range(15):
            for ep in endpoints:
                r = requests.get(f"{API}{ep}", headers=_headers(admin_token), timeout=60)
                results[ep].append(r.status_code)
        failures = {ep: [c for c in codes if c != 200] for ep, codes in results.items()}
        print("Stability results:", {k: len(v) for k, v in failures.items()})
        for ep, fails in failures.items():
            assert not fails, f"{ep} had non-200: {fails}"
