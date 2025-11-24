"""
Script to create a superuser for the application
Run this from the backend directory: python create_superuser.py
"""
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legal_doc_generator.settings')
django.setup()

from authentication.models import User

def create_superuser():
    print("=" * 50)
    print("Create Superuser Account")
    print("=" * 50)
    
    email = input("Enter email: ").strip().lower()
    username = input("Enter username: ").strip()
    password = input("Enter password: ").strip()
    confirm_password = input("Confirm password: ").strip()
    
    if password != confirm_password:
        print("❌ Passwords do not match!")
        return
    
    if not email or not username or not password:
        print("❌ All fields are required!")
        return
    
    # Check if user already exists
    existing_user = User.objects(email=email).first()
    if existing_user:
        print(f"⚠️  User with email {email} already exists.")
        choice = input("Do you want to make this user a superuser? (y/n): ").strip().lower()
        if choice == 'y':
            existing_user.is_superuser = True
            existing_user.is_staff = True
            existing_user.role = 'admin'
            existing_user.set_password(password)
            existing_user.save()
            print(f"✅ User {email} is now a superuser!")
            print(f"   Username: {existing_user.username}")
            print(f"   Email: {existing_user.email}")
            print(f"   Is Superuser: {existing_user.is_superuser}")
            print(f"   Is Staff: {existing_user.is_staff}")
            print(f"   Role: {existing_user.role}")
        else:
            print("❌ Operation cancelled.")
        return
    
    # Create new superuser
    try:
        user = User.create_superuser(
            email=email,
            username=username,
            password=password,
            role='admin',
            is_verified=True  # Skip email verification for superuser
        )
        print(f"\n✅ Superuser created successfully!")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Is Superuser: {user.is_superuser}")
        print(f"   Is Staff: {user.is_staff}")
        print(f"   Role: {user.role}")
        print(f"\n📝 You can now login at: http://localhost:5174/login")
        print(f"   Email: {email}")
        print(f"   Password: [your password]")
    except Exception as e:
        print(f"❌ Error creating superuser: {str(e)}")

if __name__ == "__main__":
    create_superuser()

