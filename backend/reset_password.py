"""
Password Reset Utility for Global Acqua Sensory App
This script helps reset passwords for any user in the system
"""

import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def list_users():
    """List all users in the database"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    users = await db.users.find({}, {"username": 1, "role": 1, "_id": 0}).to_list(1000)
    
    print("\n" + "="*50)
    print("ALL USERS IN THE SYSTEM")
    print("="*50)
    
    if not users:
        print("No users found in the database.")
    else:
        for idx, user in enumerate(users, 1):
            print(f"{idx}. Username: {user['username']:<20} Role: {user['role']}")
    
    print("="*50 + "\n")
    client.close()


async def reset_password(username: str, new_password: str):
    """Reset password for a specific user"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check if user exists
    user = await db.users.find_one({"username": username})
    if not user:
        print(f"❌ User '{username}' not found!")
        client.close()
        return False
    
    # Hash the new password
    hashed_password = pwd_context.hash(new_password)
    
    # Update the password
    result = await db.users.update_one(
        {"username": username},
        {"$set": {"password": hashed_password}}
    )
    
    if result.modified_count > 0:
        print(f"✅ Password for user '{username}' has been reset to: {new_password}")
        print(f"   Role: {user['role']}")
    else:
        print(f"❌ Failed to reset password for '{username}'")
    
    client.close()
    return result.modified_count > 0


async def main():
    if len(sys.argv) == 1:
        # No arguments - list all users
        await list_users()
        print("Usage:")
        print("  List users:    python reset_password.py")
        print("  Reset password: python reset_password.py <username> <new_password>")
        print("\nExample:")
        print("  python reset_password.py admin newpass123")
        
    elif len(sys.argv) == 3:
        # Reset password
        username = sys.argv[1]
        new_password = sys.argv[2]
        
        print(f"\n🔄 Resetting password for user: {username}")
        await reset_password(username, new_password)
        
    else:
        print("❌ Invalid arguments!")
        print("Usage:")
        print("  List users:     python reset_password.py")
        print("  Reset password: python reset_password.py <username> <new_password>")


if __name__ == "__main__":
    asyncio.run(main())
