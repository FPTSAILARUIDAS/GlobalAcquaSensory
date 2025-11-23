# How to Login - Global Acqua Sensory App

## ✅ LOGIN IS WORKING - System Verified and Tested

**Last Verified:** November 23, 2025, 6:31 AM
**Status:** All login credentials tested and working correctly

---

## 📋 Valid Login Credentials

### ADMIN ACCOUNTS (Full System Access)

| Username | Password | Notes |
|----------|----------|-------|
| **admin** | **admin123** | ⭐ **RECOMMENDED** - Default admin account |
| **Saila Ruidas** | **saila123** | Custom admin account |
| **customadmin** | **custom123** | Custom admin account |

### STANDARD USER ACCOUNTS (Limited Access)

| Username | Password | Role |
|----------|----------|------|
| **SD** | **sd123** | Standard User |
| **RM** | **rm123** | Standard User |

---

## 🔐 Step-by-Step Login Instructions

### Method 1: Using Default Admin (EASIEST)

1. Open the app in your browser: `http://localhost:3000`
2. You'll see the login page with "Global Acqua Pvt Ltd" header
3. Enter the following credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
4. Click the blue "Sign In" button
5. ✅ You'll be redirected to the Admin Dashboard

### Method 2: Using Your Custom Credentials

If you created your own user account:
1. Go to `http://localhost:3000`
2. Enter **your username** (exactly as it was created)
3. Enter **your password**
4. Click "Sign In"

---

## ⚠️ Common Login Issues & Solutions

### Issue 1: "Incorrect username or password" Error

**Possible Causes:**
- Typing error in username or password
- Extra spaces before/after username or password
- Wrong case (usernames are case-sensitive)
- Browser autocomplete filling wrong data

**Solutions:**
1. Try copying and pasting: `admin` and `admin123`
2. Clear the fields and type manually
3. Make sure no spaces before or after the text
4. Try a different browser or incognito/private mode
5. Clear browser cache and cookies

### Issue 2: Page Stays on Login Screen After Clicking "Sign In"

**Solutions:**
1. Wait 3-5 seconds (sometimes it takes a moment)
2. Check if there's an error message displayed in red
3. Restart the backend: `sudo supervisorctl restart backend`
4. Check backend status: `sudo supervisorctl status`
5. View backend logs: `tail -n 50 /var/log/supervisor/backend.err.log`

### Issue 3: Services Not Running

**Check Services:**
```bash
sudo supervisorctl status
```

**Expected Output:**
```
backend     RUNNING
frontend    RUNNING
mongodb     RUNNING
```

**If any service is stopped:**
```bash
sudo supervisorctl restart all
```

---

## 🔧 Advanced Troubleshooting

### Reset Password for Any User

If you've forgotten a password or want to change it:

```bash
cd /app/backend
python reset_password.py <username> <new_password>

# Example:
python reset_password.py admin mynewpassword
```

### List All Users

```bash
cd /app/backend
python reset_password.py
```

### Test Backend API Directly

Check if the login endpoint is working:

```bash
# Get backend URL
BACKEND_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d'=' -f2)

# Test login
curl -X POST $BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "role": "admin",
  "username": "admin"
}
```

### Check Database Users

```bash
mongosh mongodb://localhost:27017/test_database --eval "db.users.find({}, {username:1, role:1, _id:0}).pretty()" --quiet
```

---

## 📞 Still Having Issues?

If login still doesn't work after trying all the above:

1. **Take a screenshot** of the exact error message
2. **Check the browser console** (F12 → Console tab) for errors
3. **Check backend logs:**
   ```bash
   tail -n 100 /var/log/supervisor/backend.err.log
   ```
4. **Try these exact steps:**
   ```bash
   # Stop everything
   sudo supervisorctl stop all
   
   # Wait 5 seconds
   sleep 5
   
   # Start everything
   sudo supervisorctl start all
   
   # Wait 10 seconds for services to fully start
   sleep 10
   
   # Test login
   ```

---

## ✅ Verification Checklist

Before reporting login issues, verify:

- [ ] Services are running (`sudo supervisorctl status`)
- [ ] Using correct credentials (exactly: `admin` / `admin123`)
- [ ] No typos, extra spaces, or wrong case
- [ ] Tried in incognito/private browser mode
- [ ] Backend is accessible (check logs)
- [ ] Database has users (check with mongosh)
- [ ] Waited at least 3 seconds after clicking login

---

## 🎯 Quick Test

**Fastest way to verify login is working:**

```bash
# Restart services
sudo supervisorctl restart all

# Wait 10 seconds
sleep 10

# Test login API
curl -X POST $(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d'=' -f2)/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq
```

If this returns a token, the login system is working correctly.

---

*Document last updated: November 23, 2025*
*System tested and verified working*
