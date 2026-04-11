"""
Test suite for InteractiveSummaryReport refactoring
Tests the unified component used by BlindTestDailySummary and ProficiencyTestDailySummary
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sensory-dashboard-1.preview.emergentagent.com')

class TestAuth:
    """Authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "customadmin",
            "password": "admin"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["role"] == "admin"
        assert data["username"] == "customadmin"
        print(f"✓ Admin login successful, token received")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "wronguser",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        print(f"✓ Invalid credentials correctly rejected")


class TestDailySummaryAPI:
    """Tests for the daily summary API endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "customadmin",
            "password": "admin"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_daily_summary_with_data(self, auth_token):
        """Test daily summary endpoint for date with blind test data (2025-12-15)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/daily-summary/2025-12-15", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "date" in data
        assert "sessions" in data
        assert "totalSessions" in data
        assert data["date"] == "2025-12-15"
        
        print(f"✓ Daily summary returned {data['totalSessions']} sessions for 2025-12-15")
        
        # Check if we have blind test sessions
        blind_sessions = [s for s in data["sessions"] if s.get("testType") == "blind"]
        print(f"✓ Found {len(blind_sessions)} blind test sessions")
    
    def test_daily_summary_empty_date(self, auth_token):
        """Test daily summary endpoint for date with no data"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/daily-summary/2020-01-01", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["totalSessions"] == 0
        assert data["sessions"] == []
        print(f"✓ Empty date correctly returns 0 sessions")
    
    def test_daily_summary_unauthorized(self):
        """Test daily summary endpoint without auth token"""
        response = requests.get(f"{BASE_URL}/api/admin/daily-summary/2025-12-15")
        
        assert response.status_code in [401, 403]
        print(f"✓ Unauthorized access correctly rejected")
    
    def test_daily_summary_session_structure(self, auth_token):
        """Test that session data has correct structure for blind tests"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/daily-summary/2025-12-15", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        if data["totalSessions"] > 0:
            session = data["sessions"][0]
            
            # Check session structure
            assert "id" in session
            assert "sessionCode" in session
            assert "status" in session
            assert "testType" in session
            assert "ballots" in session
            
            # For blind test, check ballot structure
            if session.get("testType") == "blind" and session.get("ballots"):
                ballot = session["ballots"][0]
                assert "panelistName" in ballot
                assert "samples" in ballot
                
                # Check sample structure
                if ballot.get("samples"):
                    sample = ballot["samples"][0]
                    assert "colorCode" in sample
                    assert "status" in sample
                    print(f"✓ Blind test session structure is correct")
                    print(f"  - Panelist: {ballot.get('panelistName')}")
                    print(f"  - Samples: {len(ballot.get('samples', []))}")


class TestAdminEndpoints:
    """Tests for admin-related endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "customadmin",
            "password": "admin"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_get_users(self, auth_token):
        """Test getting list of users"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        
        # Check that customadmin exists
        admin_users = [u for u in users if u.get("username") == "customadmin"]
        assert len(admin_users) > 0
        print(f"✓ Found {len(users)} users, including customadmin")
    
    def test_get_all_sessions(self, auth_token):
        """Test getting all sessions"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/sessions/all", headers=headers)
        
        assert response.status_code == 200
        sessions = response.json()
        assert isinstance(sessions, list)
        print(f"✓ Found {len(sessions)} total sessions")
        
        # Check for different test types
        test_types = set(s.get("testType") for s in sessions)
        print(f"✓ Test types found: {test_types}")


class TestAPIHealth:
    """Basic API health checks"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API root endpoint working: {data['message']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
