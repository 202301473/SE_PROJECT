from django.contrib.auth.backends import BaseBackend
from .models import User
from mongoengine import DoesNotExist
import logging

logger = logging.getLogger(__name__)

class EmailBackend(BaseBackend):
    """Custom authentication backend that uses email with MongoEngine"""
    
    def authenticate(self, request, email=None, password=None, **kwargs):
        """Authenticate a user by email and password."""
        try:
            user = User.objects(email=email).first()
            if user and user.check_password(password):
                return user
        except DoesNotExist:
            logger.warning(f"Authentication failed: User with email {email} not found.")
            return None
        except Exception as e:
            logger.error(f"An unexpected error occurred during authentication for email {email}: {e}", exc_info=True)
            return None
        return None
    
    def get_user(self, user_id):
        """Retrieve a user by their ID."""
        try:
            # The user_id from the JWT token is already a string, so we can use it directly
            user = User.objects(id=user_id).first()
            return user
        except DoesNotExist:
            logger.warning(f"User not found: No user with ID {user_id} exists.")
            return None
        except Exception as e:
            logger.error(f"An unexpected error occurred while retrieving user {user_id}: {e}", exc_info=True)
            return None
