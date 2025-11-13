from mongoengine import Document, StringField, BooleanField, DateTimeField, EmailField
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from datetime import datetime

class User(Document):
    """MongoDB User Model using MongoEngine"""
    
    # Basic fields
    email = EmailField(required=True, unique=True, max_length=255)
    username = StringField(required=True, unique=True, max_length=150)
    name = StringField(max_length=255, default='')
    profile_picture = StringField(max_length=255, default='')
    cover_photo = StringField(max_length=255, default='') # Added cover photo field
    password = StringField(required=True)
    
    # Authentication fields
    is_active = BooleanField(default=True)
    is_staff = BooleanField(default=False)
    is_superuser = BooleanField(default=False)
    is_verified = BooleanField(default=False)  # Email verification status
    
    # OAuth fields
    google_id = StringField(max_length=255, unique=True, sparse=True)
    auth_provider = StringField(max_length=50, default='email')  # 'email' or 'google'
    
    # OTP fields
    otp_code = StringField(max_length=6)
    otp_created_at = DateTimeField()
    
    # Timestamps
    date_joined = DateTimeField(default=datetime.now)
    last_login = DateTimeField()
    
    meta = {
        'collection': 'users',
        'indexes': [
            'email',
            'username',
            {'fields': ['google_id'], 'sparse': True}
        ]
    }
    
    def __str__(self):
        return self.email
    
    def set_password(self, raw_password):
        """Hash and set the password"""
        self.password = make_password(raw_password)
    
    def check_password(self, raw_password):
        """Check if the provided password is correct"""
        return check_password(raw_password, self.password)
    
    def get_full_name(self):
        return self.name or self.username
    
    def get_short_name(self):
        return self.username
    
    @property
    def is_authenticated(self):
        """Always return True for authenticated users"""
        return True
    
    @property
    def is_anonymous(self):
        """Always return False for authenticated users"""
        return False
    
    def save(self, *args, **kwargs):
        """Override save to handle password hashing"""
        # If password is set and not already hashed, hash it
        if self.password and len(self.password) > 0 and not self.password.startswith('pbkdf2_'):
            self.set_password(self.password)
        return super(User, self).save(*args, **kwargs)
    
    @classmethod
    def create_user(cls, email, username, password=None, **extra_fields):
        """Create and return a regular user"""
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The Username field must be set')
        
        user = cls(
            email=email.lower(),
            username=username,
            **extra_fields
        )
        if password:
            user.set_password(password)
        else:
            user.password = None  # Set None password for OAuth users
        user.save()
        return user
    
    @classmethod
    def create_superuser(cls, email, username, password=None, **extra_fields):
        """Create and return a superuser"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return cls.create_user(email, username, password, **extra_fields)
