# Global Acqua Sensory App - Login Credentials

## ✅ All User Accounts & Passwords

### Admin Accounts (Full Access)
These accounts have full access to:
- User management (create/delete users)
- View all sessions
- Generate reports
- All standard user features

| Username | Password | Role | Notes |
|----------|----------|------|-------|
| **admin** | **admin123** | Admin | ⭐ Default admin account |
| **Saila Ruidas** | **saila123** | Admin | Custom admin account |
| **customadmin** | **custom123** | Admin | Custom admin account |

---

### Standard User Accounts (Limited Access)
These accounts can:
- Create new sensory analysis sessions
- Join existing sessions
- Submit ballot/evaluation data
- Cannot view history or manage users

| Username | Password | Role |
|----------|----------|------|
| **SD** | **sd123** | User |
| **RM** | **rm123** | User |
| **SC** | **sc123** | User |
| **SM** | **sm123** | User |

---

## 🔧 Password Reset Utility

If you need to reset any user's password or create new users, use the password reset utility:

```bash
cd /app/backend

# List all users
python reset_password.py

# Reset a specific user's password
python reset_password.py <username> <new_password>

# Example:
python reset_password.py admin newpass123
python reset_password.py "Saila Ruidas" mynewpassword
```

---

## 🧪 Tested & Verified

All login credentials have been tested and verified working on:
- Date: November 23, 2025
- Backend API: ✅ All authentication endpoints working
- Frontend Login: ✅ All user logins working
- Token Generation: ✅ JWT tokens generated correctly
- Role-Based Access: ✅ Admin/User permissions working

---

## 📝 Issue Resolution

**Problem:** Users were unable to log in with any credentials.

**Root Cause:** The default 'admin' user was not created because the database already contained users. The `init_admin()` function only creates the admin user if the database is empty.

**Solution Applied:**
1. Manually created the default 'admin' account in the database
2. Reset passwords for all existing users to known values
3. Created a password reset utility script for future use
4. Verified all logins work correctly

---

## 🎯 Quick Start

**For Administrators:**
- Login with: `admin` / `admin123`
- You'll see the Admin Dashboard with user management and all sessions

**For Standard Users:**
- Login with: `SD` / `sd123` or `RM` / `rm123`
- You'll see the main dashboard to create/join sensory analysis sessions

---

*Last Updated: November 23, 2025*
