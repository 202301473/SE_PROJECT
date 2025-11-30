from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from authentication.models import User
from urllib.parse import parse_qs

@database_sync_to_async
def get_user_from_token(token):
    try:
        print(f"Backend: Attempting to authenticate token: {token[:30]}...") 
        access_token = AccessToken(token)
        user_id = access_token['user_id']
        
        user = User.objects(id=user_id).first()
        
        if user:
            print(f"Backend: Token authenticated successfully for user: {user.username}") 
            return user
        else:
            print(f"Backend: User not found for token user_id: {user_id}")
            return AnonymousUser()
    except Exception as e:
        print(f"Backend: Token authentication failed: {e}") 
        return AnonymousUser()

class TokenAuthMiddleware:
    """
    Custom middleware that takes a token from the query string and authenticates it.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        print("Backend: TokenAuthMiddleware called.") 
        query_string = parse_qs(scope['query_string'].decode('utf8'))
        token = query_string.get('token', [None])[0]

        if token:
            print(f"Backend: Token found in query string.") 
            scope['user'] = await get_user_from_token(token)
        else:
            print("Backend: No token found in query string.") 
            scope['user'] = AnonymousUser()
        
        print(f"Backend: User in scope after TokenAuthMiddleware: {scope['user']}") 

        return await self.inner(scope, receive, send)
