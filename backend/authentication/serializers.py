from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.Serializer):
    """Serializer for User MongoEngine Document"""
    id = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    username = serializers.CharField(read_only=True)
    name = serializers.CharField(read_only=True)
    profile_picture = serializers.URLField(read_only=True)
    cover_photo = serializers.URLField(read_only=True) # Added cover_photo
    auth_provider = serializers.CharField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)
    
    def to_representation(self, instance):
        """Convert MongoEngine document to dict"""
        return {
            'id': str(instance.id),
            'email': instance.email,
            'username': instance.username,
            'name': instance.name,
            'profile_picture': instance.profile_picture,
            'cover_photo': instance.cover_photo, # Added cover_photo
            'auth_provider': instance.auth_provider,
            'date_joined': instance.date_joined
        }

class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration"""
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True, max_length=150)
    name = serializers.CharField(required=False, allow_blank=True, max_length=255)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects(email=value).first():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        """Check if username already exists"""
        if User.objects(username=value).first():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def validate(self, attrs):
        """Validate password match"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        """Create new user"""
        validated_data.pop('password2')
        user = User.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            name=validated_data.get('name', ''),
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

class GoogleAuthSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(required=True, max_length=6, min_length=6)

class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class UserProfileSerializer(serializers.Serializer):
    """Serializer for updating user profile"""
    name = serializers.CharField(required=False, allow_blank=True, max_length=255)
    profile_picture = serializers.URLField(required=False, allow_blank=True, max_length=255)
    cover_photo = serializers.URLField(required=False, allow_blank=True, max_length=255) # Added cover_photo

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
        instance.cover_photo = validated_data.get('cover_photo', instance.cover_photo) # Added cover_photo
        instance.save()
        return instance
