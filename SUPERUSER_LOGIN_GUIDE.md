# How to Login as Superuser - Step by Step Guide

## Method 1: Using Django Management Command (Recommended)

### Step 1: Create a Superuser

Open a terminal in the backend directory and run:

```bash
cd SE_PROJECT\backend
python manage.py createsuperuser_custom
```

You'll be prompted to enter:
- Email: `admin@example.com`
- Username: `admin`
- Password: `your_secure_password`
- Confirm Password: `your_secure_password`

### Step 2: Login Through Frontend

1. Navigate to: `http://localhost:5174/login`
2. Enter your superuser credentials:
   - Email: `admin@example.com`
   - Password: `your_secure_password`
3. Click "Login"
4. You should now be logged in as superuser

---

## Method 2: Using Python Script

### Step 1: Run the Script

```bash
cd SE_PROJECT\backend
python create_superuser.py
```

Follow the prompts to create your superuser account.

### Step 2: Login

Same as Method 1, Step 2.

---

## Method 3: Using Django Shell

### Step 1: Open Django Shell

```bash
cd SE_PROJECT\backend
python manage.py shell
```

### Step 2: Create Superuser in Shell

```python
from authentication.models import User

# Create superuser
user = User.create_superuser(
    email='admin@example.com',
    username='admin',
    password='your_secure_password',
    role='admin',
    is_verified=True
)

print(f"Superuser created: {user.email}")
print(f"Is Superuser: {user.is_superuser}")
print(f"Is Staff: {user.is_staff}")
```

### Step 3: Exit Shell and Login

```python
exit()
```

Then login through the frontend as described in Method 1, Step 2.

---

## Method 4: Quick Command (Non-Interactive)

If you want to create a superuser without prompts:

```bash
cd SE_PROJECT\backend
python manage.py createsuperuser_custom --email admin@example.com --username admin --password Admin123! --noinput
```

**⚠️ Warning**: This method shows the password in command history. Use only for development.

---

## Verify Superuser Status

After logging in, you can verify you're a superuser by:

1. **Check the Navbar**: You should see "Verify Lawyers" link (only visible to admins)
2. **Access Admin Page**: Navigate to `/admin/lawyer-verification` - should work without errors
3. **Check Profile**: Your user object should have `is_superuser: true` and `role: 'admin'`

---

## Troubleshooting

### Issue: "User already exists"
**Solution**: Use Method 3 (Django Shell) to update existing user:
```python
from authentication.models import User

user = User.objects(email='admin@example.com').first()
user.is_superuser = True
user.is_staff = True
user.role = 'admin'
user.set_password('your_new_password')
user.is_verified = True
user.save()
```

### Issue: "Access denied" when accessing admin page
**Solution**: Make sure:
- User has `is_superuser = True` OR `role = 'admin'`
- User is logged in
- Backend server is running

### Issue: Can't login after creating superuser
**Solution**: 
- Check if `is_verified = True` (superusers should skip email verification)
- Verify password is correct
- Check browser console for errors
- Verify backend is running and MongoDB is connected

---

## Quick Test Superuser Account

For testing purposes, you can create a test superuser:

```bash
cd SE_PROJECT\backend
python manage.py createsuperuser_custom --email testadmin@test.com --username testadmin --password Test123! --noinput
```

Then login with:
- Email: `testadmin@test.com`
- Password: `Test123!`

---

## Security Notes

⚠️ **Important for Production**:
- Use strong passwords
- Don't commit superuser credentials to git
- Consider using environment variables for admin credentials
- Regularly rotate admin passwords
- Limit superuser accounts to necessary personnel only

---

## Example: Complete Setup

```bash
# 1. Navigate to backend
cd SE_PROJECT\backend

# 2. Create superuser
python manage.py createsuperuser_custom

# Enter when prompted:
# Email: admin@myapp.com
# Username: admin
# Password: SecurePass123!
# Confirm: SecurePass123!

# 3. Start backend server (if not running)
python manage.py runserver

# 4. In another terminal, start frontend (if not running)
cd SE_PROJECT\frontend
npm run dev

# 5. Open browser and go to:
# http://localhost:5174/login

# 6. Login with:
# Email: admin@myapp.com
# Password: SecurePass123!

# 7. You should see "Verify Lawyers" in navbar
# 8. Navigate to /admin/lawyer-verification to verify lawyers
```

---

## Check Current User Status

To check if a user is a superuser, you can use Django shell:

```python
from authentication.models import User

user = User.objects(email='admin@example.com').first()
if user:
    print(f"Email: {user.email}")
    print(f"Is Superuser: {user.is_superuser}")
    print(f"Is Staff: {user.is_staff}")
    print(f"Role: {user.role}")
else:
    print("User not found")
```

