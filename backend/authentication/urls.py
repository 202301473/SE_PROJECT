from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    signup_view, 
    login_view, 
    google_auth_view, 
    logout_view,
    verify_otp_view,
    resend_otp_view,
    profile_detail_update_view,
    forgot_password_view,
    change_password_view,
    add_password_view,
    reset_password_view
)

urlpatterns = [
    path('signup/', signup_view, name='signup'),
    path('login/', login_view, name='login'),
    path('google/', google_auth_view, name='google_auth'),
    path('verify-otp/', verify_otp_view, name='verify_otp'),
    path('resend-otp/', resend_otp_view, name='resend_otp'),
    path('profile/', profile_detail_update_view, name='profile'), # Use the combined view
    path('logout/', logout_view, name='logout'),
    path('forgot-password/', forgot_password_view, name='forgot_password'),
    path('reset-password/', reset_password_view, name='reset_password'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('change-password/', change_password_view, name='change_password'),
    path('add-password/', add_password_view, name='add_password'),
]
