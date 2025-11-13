from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from mongoengine import DoesNotExist
from .models import User
import random
import cloudinary
import cloudinary.uploader

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, GoogleAuthSerializer, VerifyOTPSerializer, ResendOTPSerializer, UserProfileSerializer
from .otp_utils import create_and_send_otp, is_otp_valid, clear_otp

def get_tokens_for_user(user):
    """Generate JWT tokens for a MongoEngine user"""
    refresh = RefreshToken()
    refresh['user_id'] = str(user.id)
    refresh['email'] = user.email
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """Register new user and send OTP for verification"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = User.create_user(
            email=serializer.validated_data['email'],
            username=serializer.validated_data['username'],
            name=serializer.validated_data['name'],
            password=serializer.validated_data['password'],
        )
        # User is not verified yet, send OTP
        user.is_verified = False
        user.save()
        
        # Generate and send OTP
        otp_sent = create_and_send_otp(user)
        
        if not otp_sent:
            return Response({
                'error': 'Failed to send OTP. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'message': 'Registration successful. OTP sent to your email. Please verify to continue.',
            'email': user.email,
            'requires_verification': True,
            'redirect': 'verify-otp'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login user with email and password"""
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    password = serializer.validated_data['password']
    
    try:
        user = User.objects(email=email).first()
        if not user:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    except DoesNotExist:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Check if user registered with Google
    if user.auth_provider == 'google':
        return Response({
            'error': 'This account is registered with Google. Please use Google Sign In.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Authenticate user
    user = authenticate(email=email, password=password)
    if user is None:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Check if user is verified
    if not user.is_verified:
        # Send OTP for verification
        otp_sent = create_and_send_otp(user)
        
        if not otp_sent:
            return Response({
                'error': 'Failed to send OTP. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'message': 'OTP sent to your email. Please verify to continue.',
            'email': user.email,
            'requires_verification': True,
            'redirect': 'verify-otp'
        }, status=status.HTTP_200_OK)
    
    # User is verified, return tokens
    tokens = get_tokens_for_user(user)
    user_data = UserSerializer(user).data
    
    return Response({
        'message': 'Login successful',
        'user': user_data,
        'tokens': tokens,
        'redirect': 'home'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth_view(request):
    """Authenticate user with Google OAuth"""
    # Check if Google Client ID is configured
    if not settings.GOOGLE_CLIENT_ID:
        return Response({
            'error': 'Google Client ID is not configured. Please set the GOOGLE_CLIENT_ID environment variable in your .env file or system environment.',
            'solution': '1. Create a .env file in your project root\n2. Add GOOGLE_CLIENT_ID=your_client_id_here\n3. Restart your Django server'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    serializer = GoogleAuthSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    token = serializer.validated_data['token']
    
    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        
        # Get user info from Google
        email = idinfo.get('email')
        google_id = idinfo.get('sub')
        name = idinfo.get('name', '')
        
        if not email:
            return Response({
                'error': 'Email not provided by Google'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user exists
        user = None
        try:
            user = User.objects(email=email).first()
            if user:
                # Update Google ID if not set
                if not user.google_id:
                    user.google_id = google_id
                    user.auth_provider = 'google'
                    user.is_verified = True  # Google users are auto-verified
                    user.save()
        except DoesNotExist:
            user = None
        
        if not user:
            # Create new user
            username = email.split('@')[0]
            # Ensure username is unique
            base_username = username
            counter = 1
            while User.objects(username=username).first():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User.create_user(
                email=email,
                username=username,
                name=name,
                google_id=google_id,
                auth_provider='google',
                password='!'  # Unusable password for OAuth users
            )
            user.is_verified = True  # Google users are auto-verified
            user.save()
        
        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data
        
        return Response({
            'message': 'Google authentication successful',
            'user': user_data,
            'tokens': tokens,
            'redirect': 'home'  # Frontend should redirect to home page
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        error_message = str(e)
        if 'aud' in error_message:
            error_message = 'Invalid Google client ID'
        elif 'exp' in error_message:
            error_message = 'Google token has expired'
        return Response({
            'error': 'Invalid Google token',
            'details': error_message
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_detail_update_view(request):
    """Get or update authenticated user profile"""
    user = request.user
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    elif request.method == 'PATCH':
        data = request.data.copy() # Make a mutable copy of request.data
        
        # Handle profile picture upload
        profile_picture_file = request.FILES.get('profile_picture')
        if profile_picture_file:
            try:
                # Upload to Cloudinary
                upload_result = cloudinary.uploader.upload(profile_picture_file)
                data['profile_picture'] = upload_result['secure_url'] # Add the URL to the data for the serializer
            except Exception as e:
                return Response({
                    'error': f'Failed to upload profile picture: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Handle cover photo upload
        cover_photo_file = request.FILES.get('cover_photo')
        if cover_photo_file:
            try:
                # Upload to Cloudinary
                upload_result = cloudinary.uploader.upload(cover_photo_file)
                data['cover_photo'] = upload_result['secure_url'] # Add the URL to the data for the serializer
            except Exception as e:
                return Response({
                    'error': f'Failed to upload cover photo: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        # Handle other profile data (e.g., name)
        serializer = UserProfileSerializer(user, data=data, partial=True) # Pass the modified data
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_view(request):
    """Verify OTP and activate user account"""
    serializer = VerifyOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    otp = serializer.validated_data['otp_code']
    
    try:
        user = User.objects(email=email).first()
        if not user:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)
    except DoesNotExist:
        return Response({
            'error': 'User not found.'
        }, status=status.HTTP_404_NOT_FOUND)
        
    if is_otp_valid(user, otp):
        user.is_verified = True
        user.save()
        clear_otp(user) # Clear OTP after successful verification
        
        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data
        
        return Response({
            'message': 'Account verified successfully.',
            'user': user_data,
            'tokens': tokens,
            'redirect': 'home'
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'error': 'Invalid or expired OTP.'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp_view(request):
    """Resend OTP to user's email"""
    serializer = ResendOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    
    try:
        user = User.objects(email=email).first()
        if not user:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)
    except DoesNotExist:
        return Response({
            'error': 'User not found.'
        }, status=status.HTTP_404_NOT_FOUND)
        
    if user.is_verified:
        return Response({
            'message': 'User is already verified.'
        }, status=status.HTTP_400_BAD_REQUEST)
        
    otp_sent = create_and_send_otp(user)
    
    if otp_sent:
        return Response({
            'message': 'New OTP sent to your email.'
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'error': 'Failed to send OTP. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout user by blacklisting the refresh token"""
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)