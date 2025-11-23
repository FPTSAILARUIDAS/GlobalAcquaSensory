#!/usr/bin/env python3
"""
Backend Authentication Testing for Global Acqua Sensory App
Tests all authentication endpoints and user scenarios
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

print(f"Testing backend at: {API_BASE}")

class AuthTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
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
    
    def test_login(self, username, password, expected_role=None, should_succeed=True):
        """Test login with given credentials"""
        test_name = f"Login - {username}"
        
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json={"username": username, "password": password},
                headers={"Content-Type": "application/json"}
            )
            
            if should_succeed:
                if response.status_code == 200:
                    data = response.json()
                    required_fields = ["access_token", "token_type", "role", "username"]
                    
                    # Check all required fields are present
                    missing_fields = [field for field in required_fields if field not in data]
                    if missing_fields:
                        self.log_result(test_name, False, f"Missing fields: {missing_fields}")
                        return None
                    
                    # Check role if specified
                    if expected_role and data["role"] != expected_role:
                        self.log_result(test_name, False, f"Expected role '{expected_role}', got '{data['role']}'")
                        return None
                    
                    # Check username matches
                    if data["username"] != username:
                        self.log_result(test_name, False, f"Username mismatch: expected '{username}', got '{data['username']}'")
                        return None
                    
                    self.log_result(test_name, True, f"Role: {data['role']}, Token type: {data['token_type']}")
                    return data["access_token"]
                else:
                    self.log_result(test_name, False, f"Expected 200, got {response.status_code}: {response.text}")
                    return None
            else:
                # Should fail
                if response.status_code == 401:
                    self.log_result(test_name, True, f"Correctly rejected with 401: {response.json().get('detail', 'No detail')}")
                    return None
                else:
                    self.log_result(test_name, False, f"Expected 401, got {response.status_code}: {response.text}")
                    return None
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return None
    
    def setup_test_users(self):
        """Setup additional test users using admin credentials"""
        print("Setting up test users...")
        
        # First login as admin to get token
        admin_token = self.test_login("admin", "admin123", "admin", True)
        if not admin_token:
            print("❌ Cannot setup test users - admin login failed")
            return False
        
        self.admin_token = admin_token
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        # Test users to create
        test_users = [
            {"username": "Saila Ruidas", "password": "saila123", "role": "admin"},
            {"username": "customadmin", "password": "custom123", "role": "admin"},
            {"username": "SD", "password": "sd123", "role": "user"},
            {"username": "RM", "password": "rm123", "role": "user"}
        ]
        
        for user in test_users:
            try:
                response = self.session.post(
                    f"{API_BASE}/admin/users",
                    json=user,
                    headers=headers
                )
                
                if response.status_code == 200:
                    print(f"✅ Created user: {user['username']} ({user['role']})")
                elif response.status_code == 400 and "already exists" in response.text:
                    print(f"ℹ️  User already exists: {user['username']}")
                else:
                    print(f"❌ Failed to create user {user['username']}: {response.status_code} - {response.text}")
                    
            except Exception as e:
                print(f"❌ Exception creating user {user['username']}: {str(e)}")
        
        print()
        return True
    
    def test_all_authentication_scenarios(self):
        """Test all authentication scenarios from the review request"""
        print("=" * 60)
        print("AUTHENTICATION TESTING - Global Acqua Sensory App")
        print("=" * 60)
        print()
        
        # Setup test users first
        if not self.setup_test_users():
            print("❌ Test setup failed, continuing with available users...")
        
        print("Testing Authentication Endpoints...")
        print("-" * 40)
        
        # Test Case 1: Default admin login
        self.test_login("admin", "admin123", "admin", True)
        
        # Test Case 2: Custom admin (Saila Ruidas)
        self.test_login("Saila Ruidas", "saila123", "admin", True)
        
        # Test Case 3: Custom admin (customadmin)
        self.test_login("customadmin", "custom123", "admin", True)
        
        # Test Case 4: Standard user (SD)
        self.test_login("SD", "sd123", "user", True)
        
        # Test Case 5: Standard user (RM)
        self.test_login("RM", "rm123", "user", True)
        
        # Test Case 6: Invalid credentials
        self.test_login("admin", "wrongpassword", None, False)
        
        # Additional edge cases
        self.test_login("nonexistent", "password", None, False)
        self.test_login("", "", None, False)
        
        # Test API root endpoint
        self.test_api_root()
        
        print("=" * 60)
        print("SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print()
        
        if failed_tests > 0:
            print("FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"❌ {result['test']}: {result['details']}")
        else:
            print("🎉 All tests passed!")
        
        return failed_tests == 0
    
    def test_api_root(self):
        """Test the API root endpoint"""
        test_name = "API Root Endpoint"
        try:
            response = self.session.get(f"{API_BASE}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_result(test_name, True, f"Message: {data['message']}")
                else:
                    self.log_result(test_name, False, "No message field in response")
            else:
                self.log_result(test_name, False, f"Expected 200, got {response.status_code}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")

if __name__ == "__main__":
    tester = AuthTester()
    success = tester.test_all_authentication_scenarios()
    exit(0 if success else 1)