"""
Quick script to create admin user
Run: python create_admin.py
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legal_doc_generator.settings')
django.setup()

from authentication.models import User

# Create admin user
email = 'admin@test.com'
username = 'admin'
password = 'Admin123!'

try:
    # Check if user exists
    existing = User.objects(email=email).first()
    if existing:
        print(f"User {email} already exists. Making them admin...")
        existing.is_superuser = True
        existing.is_staff = True
        existing.role = 'admin'
        existing.set_password(password)
        existing.is_verified = True
        existing.save()
        print(f"SUCCESS: User {email} is now admin!")
    else:
        user = User.create_superuser(
            email=email,
            username=username,
            password=password,
            role='admin',
            is_verified=True
        )
        print(f"SUCCESS: Admin user created!")
        print(f"Email: {email}")
        print(f"Password: {password}")
    print(f"\nYou can now login at: http://localhost:5174/login")
except Exception as e:
    print(f"ERROR: {e}")

