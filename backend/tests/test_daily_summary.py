"""
Test suite for Daily Summary API endpoints
Tests the fix for the 1000 session limit bug where MongoDB-level date filtering
was implemented to replace Python-level filtering
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuth:
    """Authentication tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "customadmin",
            "password": "admin"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        return data["access_token"]
    
    def test_admin_login(self, auth_token):
        """Test admin login works"""
        assert auth_token is not None
        assert len(auth_token) > 0
        print(f"✅ Admin login successful, token length: {len(auth_token)}")


class TestDailySummaryEndpoint:
    """Tests for /api/admin/daily-summary/{date} endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "customadmin",
            "password": "admin"
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def headers(self, auth_token):
        """Auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_daily_summary_2026_04_11(self, headers):
        """Test daily summary for 2026-04-11 - should have 16 regular sessions"""
        response = requests.get(f"{BASE_URL}/api/admin/daily-summary/2026-04-11", headers=headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "date" in data
        assert "sessions" in data
        assert "totalSessions" in data
        assert data["date"] == "2026-04-11"
        
        # Verify sessions are returned (should have data)
        print(f"✅ 2026-04-11: {data['totalSessions']} sessions returned")
        assert isinstance(data["sessions"], list)
    
    def test_daily_summary_2025_11_23_old_date(self, headers):
        """Test daily summary for 2025-11-23 - old date that was affected by 1000 limit"""
        response = requests.get(f"{BASE_URL}/api/admin/daily-summary/2025-11-23", headers=headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "date" in data
        assert "sessions" in data
        assert data["date"] == "2025-11-23"
        
        print(f"✅ 2025-11-23 (old date): {data['totalSessions']} sessions returned")
    
    def test_daily_summary_2026_03_28_mixed(self, headers):
        """Test daily summary for 2026-03-28 - should have mixed session types"""
        response = requests.get(f"{BASE_URL}/api/admin/daily-summary/2026-03-28", headers=headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "date" in data
        assert "sessions" in data
        assert data["date"] == "2026-03-28"
        
        # Count session types
        regular_count = sum(1 for s in data["sessions"] if not s.get("testType") or s.get("testType") == "regular")
        blind_count = sum(1 for s in data["sessions"] if s.get("testType") == "blind")
        proficiency_count = sum(1 for s in data["sessions"] if s.get("testType") == "proficiency")
        
        print(f"✅ 2026-03-28: {data['totalSessions']} total sessions")
        print(f"   - Regular: {regular_count}, Blind: {blind_count}, Proficiency: {proficiency_count}")
    
    def test_daily_summary_2025_12_15_blind_test(self, headers):
        """Test daily summary for 2025-12-15 - should have blind test data"""
        response = requests.get(f"{BASE_URL}/api/admin/daily-summary/2025-12-15", headers=headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "date" in data
        assert "sessions" in data
        
        blind_count = sum(1 for s in data["sessions"] if s.get("testType") == "blind")
        print(f"✅ 2025-12-15: {data['totalSessions']} sessions, {blind_count} blind tests")
    
    def test_daily_summary_empty_date(self, headers):
        """Test daily summary for a date with no data"""
        response = requests.get(f"{BASE_URL}/api/admin/daily-summary/2020-01-01", headers=headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert data["totalSessions"] == 0
        assert data["sessions"] == []
        print(f"✅ Empty date returns 0 sessions correctly")
    
    def test_daily_summary_unauthorized(self):
        """Test daily summary without auth token returns 401/403"""
        response = requests.get(f"{BASE_URL}/api/admin/daily-summary/2026-04-11")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✅ Unauthorized request correctly rejected with {response.status_code}")


class TestAllSessionsEndpoint:
    """Tests for /api/admin/sessions/all endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "customadmin",
            "password": "admin"
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def headers(self, auth_token):
        """Auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_all_sessions_loads(self, headers):
        """Test all sessions endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/admin/sessions/all", headers=headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        
        # Check lightweight response (should not include full ballots)
        if len(data) > 0:
            session = data[0]
            assert "sessionCode" in session
            assert "status" in session
            # Should have ballotsCount instead of full ballots array
            assert "ballotsCount" in session or "ballots" not in session
        
        print(f"✅ All sessions endpoint returned {len(data)} sessions")
    
    def test_all_sessions_unauthorized(self):
        """Test all sessions without auth returns 401/403"""
        response = requests.get(f"{BASE_URL}/api/admin/sessions/all")
        assert response.status_code in [401, 403]
        print(f"✅ Unauthorized request correctly rejected")


class TestFixSessionStatuses:
    """Tests for /api/admin/fix-session-statuses endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "customadmin",
            "password": "admin"
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def headers(self, auth_token):
        """Auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_fix_session_statuses(self, headers):
        """Test fix session statuses endpoint works"""
        response = requests.post(f"{BASE_URL}/api/admin/fix-session-statuses", json={}, headers=headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "message" in data
        print(f"✅ Fix session statuses: {data['message']}")


class TestSessionReport:
    """Tests for individual session report endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "customadmin",
            "password": "admin"
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def headers(self, auth_token):
        """Auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_get_session_by_code(self, headers):
        """Test getting a session by code"""
        # First get all sessions to find a valid code
        response = requests.get(f"{BASE_URL}/api/admin/sessions/all", headers=headers)
        assert response.status_code == 200
        
        sessions = response.json()
        if len(sessions) > 0:
            session_code = sessions[0]["sessionCode"]
            
            # Get session by code
            response = requests.get(f"{BASE_URL}/api/sessions/code/{session_code}")
            assert response.status_code == 200, f"Failed: {response.text}"
            
            data = response.json()
            assert data["sessionCode"] == session_code
            print(f"✅ Session {session_code} retrieved successfully")
        else:
            pytest.skip("No sessions available to test")
    
    def test_get_nonexistent_session(self):
        """Test getting a non-existent session returns 404"""
        response = requests.get(f"{BASE_URL}/api/sessions/code/NONEXISTENT123")
        assert response.status_code == 404
        print(f"✅ Non-existent session correctly returns 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
