#!/usr/bin/env python3
"""
Additional Authentication Tests for Global Acqua Sensory App
Tests token validation, protected endpoints, and edge cases
"""

import requests
import json
import os
from pathlib import Path

# Load backend URL from frontend/.env
def get_backend_url():
    frontend_env_path = Path("/app/frontend/.env")
    if frontend_env_path.exists():
        with open(frontend_env_path, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    return "http://localhost:8001"

BACKEND_URL = get_backend_url()
API_BASE = f"{BACKEND_URL}/api"

print(f"Testing additional auth scenarios at: {API_BASE}")

class AdditionalAuthTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        
    def log_result(self, test_name, success, details=""):
        result = {
            "test": test_name,
            "success": success,
            "details": details
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        print()
    
    def get_valid_token(self, username="admin", password="admin123"):
        """Get a valid token for testing"""
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json={"username": username, "password": password}
            )
            if response.status_code == 200:
                return response.json()["access_token"]
        except:
            pass
        return None
    
    def test_protected_endpoints_without_token(self):
        """Test that protected endpoints reject requests without tokens"""
        protected_endpoints = [
            ("GET", "/admin/users", "Get Users"),
            ("POST", "/admin/users", "Create User"),
            ("GET", "/sessions", "Get Sessions"),
            ("POST", "/sessions/create", "Create Session")
        ]
        
        for method, endpoint, name in protected_endpoints:
            test_name = f"Protected Endpoint Without Token - {name}"
            try:
                if method == "GET":
                    response = self.session.get(f"{API_BASE}{endpoint}")
                elif method == "POST":
                    response = self.session.post(f"{API_BASE}{endpoint}", json={})
                
                if response.status_code == 403:
                    self.log_result(test_name, True, "Correctly rejected with 403 Forbidden")
                elif response.status_code == 401:
                    self.log_result(test_name, True, "Correctly rejected with 401 Unauthorized")
                else:
                    self.log_result(test_name, False, f"Expected 401/403, got {response.status_code}")
                    
            except Exception as e:
                self.log_result(test_name, False, f"Exception: {str(e)}")
    
    def test_invalid_token_access(self):
        """Test access with invalid tokens"""
        invalid_tokens = [
            ("invalid.token.here", "Malformed Token"),
            ("Bearer invalid.token.here", "Bearer Prefix with Invalid Token"),
            ("", "Empty Token")
        ]
        
        for token, description in invalid_tokens:
            test_name = f"Invalid Token Access - {description}"
            try:
                headers = {"Authorization": f"Bearer {token}"} if token else {}
                response = self.session.get(f"{API_BASE}/admin/users", headers=headers)
                
                if response.status_code in [401, 403]:
                    self.log_result(test_name, True, f"Correctly rejected with {response.status_code}")
                else:
                    self.log_result(test_name, False, f"Expected 401/403, got {response.status_code}")
                    
            except Exception as e:
                self.log_result(test_name, False, f"Exception: {str(e)}")
    
    def test_valid_token_access(self):
        """Test access with valid tokens"""
        admin_token = self.get_valid_token("admin", "admin123")
        user_token = self.get_valid_token("SD", "sd123")
        
        if not admin_token:
            self.log_result("Get Admin Token", False, "Could not get admin token")
            return
        
        if not user_token:
            self.log_result("Get User Token", False, "Could not get user token")
            return
        
        # Test admin access to admin endpoints
        test_name = "Valid Admin Token - Access Admin Endpoint"
        try:
            headers = {"Authorization": f"Bearer {admin_token}"}
            response = self.session.get(f"{API_BASE}/admin/users", headers=headers)
            
            if response.status_code == 200:
                self.log_result(test_name, True, "Admin successfully accessed admin endpoint")
            else:
                self.log_result(test_name, False, f"Expected 200, got {response.status_code}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        # Test user access to user endpoints
        test_name = "Valid User Token - Access User Endpoint"
        try:
            headers = {"Authorization": f"Bearer {user_token}"}
            response = self.session.get(f"{API_BASE}/sessions", headers=headers)
            
            if response.status_code == 200:
                self.log_result(test_name, True, "User successfully accessed user endpoint")
            else:
                self.log_result(test_name, False, f"Expected 200, got {response.status_code}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
        
        # Test user access to admin endpoints (should fail)
        test_name = "User Token - Access Admin Endpoint (Should Fail)"
        try:
            headers = {"Authorization": f"Bearer {user_token}"}
            response = self.session.get(f"{API_BASE}/admin/users", headers=headers)
            
            if response.status_code == 403:
                self.log_result(test_name, True, "User correctly denied access to admin endpoint")
            else:
                self.log_result(test_name, False, f"Expected 403, got {response.status_code}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
    
    def test_login_edge_cases(self):
        """Test login with various edge cases"""
        edge_cases = [
            ({"username": "admin"}, "Missing Password"),
            ({"password": "admin123"}, "Missing Username"),
            ({}, "Empty Request Body"),
            ({"username": "admin", "password": "admin123", "extra": "field"}, "Extra Fields"),
            ({"username": "ADMIN", "password": "admin123"}, "Case Sensitive Username"),
            ({"username": "admin", "password": "ADMIN123"}, "Case Sensitive Password")
        ]
        
        for payload, description in edge_cases:
            test_name = f"Login Edge Case - {description}"
            try:
                response = self.session.post(f"{API_BASE}/auth/login", json=payload)
                
                if description in ["Missing Password", "Missing Username", "Empty Request Body"]:
                    # These should fail with 422 (validation error) or 401
                    if response.status_code in [422, 401]:
                        self.log_result(test_name, True, f"Correctly rejected with {response.status_code}")
                    else:
                        self.log_result(test_name, False, f"Expected 422/401, got {response.status_code}")
                elif description == "Extra Fields":
                    # Should succeed (extra fields ignored)
                    if response.status_code == 200:
                        self.log_result(test_name, True, "Login succeeded with extra fields")
                    else:
                        self.log_result(test_name, False, f"Expected 200, got {response.status_code}")
                else:
                    # Case sensitive tests should fail
                    if response.status_code == 401:
                        self.log_result(test_name, True, "Correctly case-sensitive")
                    else:
                        self.log_result(test_name, False, f"Expected 401, got {response.status_code}")
                        
            except Exception as e:
                self.log_result(test_name, False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all additional authentication tests"""
        print("=" * 60)
        print("ADDITIONAL AUTHENTICATION TESTING")
        print("=" * 60)
        print()
        
        print("Testing Protected Endpoints Without Token...")
        print("-" * 40)
        self.test_protected_endpoints_without_token()
        
        print("Testing Invalid Token Access...")
        print("-" * 40)
        self.test_invalid_token_access()
        
        print("Testing Valid Token Access...")
        print("-" * 40)
        self.test_valid_token_access()
        
        print("Testing Login Edge Cases...")
        print("-" * 40)
        self.test_login_edge_cases()
        
        print("=" * 60)
        print("ADDITIONAL TESTS SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Additional Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print()
        
        if failed_tests > 0:
            print("FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"❌ {result['test']}: {result['details']}")
        else:
            print("🎉 All additional tests passed!")
        
        return failed_tests == 0

if __name__ == "__main__":
    tester = AdditionalAuthTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)