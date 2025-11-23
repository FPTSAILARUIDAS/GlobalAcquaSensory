#!/usr/bin/env python3
"""
Admin Deletion Protection Test for Global Acqua Sensory App
Specifically tests that the default admin account cannot be deleted
"""

import requests
import json
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

print("=" * 70)
print("ADMIN DELETION PROTECTION TEST")
print("Global Acqua Sensory App")
print("=" * 70)
print(f"Testing backend at: {API_BASE}")
print()

def test_admin_deletion_protection():
    """Test that the default admin account cannot be deleted"""
    session = requests.Session()
    
    print("Step 1: Login as a different admin user (Saila Ruidas)...")
    login_response = session.post(
        f"{API_BASE}/auth/login",
        json={"username": "Saila Ruidas", "password": "saila123"},
        headers={"Content-Type": "application/json"}
    )
    
    if login_response.status_code != 200:
        print(f"❌ FAILED: Cannot login as Saila Ruidas: {login_response.status_code}")
        return False
    
    token_data = login_response.json()
    admin_token = token_data["access_token"]
    print(f"✅ SUCCESS: Logged in as {token_data['username']} (role: {token_data['role']})")
    
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }
    
    print("\nStep 2: Verify admin user exists before deletion attempt...")
    users_response = session.get(f"{API_BASE}/admin/users", headers=headers)
    if users_response.status_code != 200:
        print(f"❌ FAILED: Cannot get users list: {users_response.status_code}")
        return False
    
    users = users_response.json()
    admin_exists_before = any(user["username"] == "admin" for user in users)
    if not admin_exists_before:
        print("❌ FAILED: Admin user does not exist before deletion test")
        return False
    
    print("✅ SUCCESS: Admin user exists in database")
    
    print("\nStep 3: Attempt to delete the default admin account...")
    delete_response = session.delete(f"{API_BASE}/admin/users/admin", headers=headers)
    
    print(f"Response Status: {delete_response.status_code}")
    print(f"Response Body: {delete_response.text}")
    
    # Verify deletion is rejected with 400 Bad Request
    if delete_response.status_code != 400:
        print(f"❌ FAILED: Expected 400 Bad Request, got {delete_response.status_code}")
        return False
    
    print("✅ SUCCESS: Deletion request properly rejected with 400 Bad Request")
    
    print("\nStep 4: Verify correct error message...")
    try:
        error_data = delete_response.json()
        expected_message = "Cannot delete the default admin account"
        actual_message = error_data.get("detail")
        
        if actual_message != expected_message:
            print(f"❌ FAILED: Expected error message '{expected_message}', got '{actual_message}'")
            return False
        
        print(f"✅ SUCCESS: Correct error message received: '{actual_message}'")
    except:
        print("❌ FAILED: Cannot parse error response as JSON")
        return False
    
    print("\nStep 5: Verify admin user still exists after failed deletion...")
    users_response_after = session.get(f"{API_BASE}/admin/users", headers=headers)
    if users_response_after.status_code != 200:
        print(f"❌ FAILED: Cannot get users list after deletion attempt: {users_response_after.status_code}")
        return False
    
    users_after = users_response_after.json()
    admin_exists_after = any(user["username"] == "admin" for user in users_after)
    if not admin_exists_after:
        print("❌ FAILED: Admin user was deleted despite protection")
        return False
    
    print("✅ SUCCESS: Admin user still exists in database")
    
    return True

if __name__ == "__main__":
    try:
        success = test_admin_deletion_protection()
        
        print("\n" + "=" * 70)
        print("TEST RESULT")
        print("=" * 70)
        
        if success:
            print("🎉 TEST PASSED: Default admin deletion protection is working correctly!")
            print("\nSummary:")
            print("- ✅ Login as different admin user successful")
            print("- ✅ Admin user exists before deletion attempt")
            print("- ✅ Deletion request properly rejected (400 Bad Request)")
            print("- ✅ Correct error message: 'Cannot delete the default admin account'")
            print("- ✅ Admin user still exists after failed deletion")
        else:
            print("❌ TEST FAILED: Default admin deletion protection has issues!")
        
        exit(0 if success else 1)
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: Exception occurred: {str(e)}")
        exit(1)