from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from authentication.models import User
from urllib.parse import parse_qs

class CrossOriginOpenerPolicyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response['Cross-Origin-Opener-Policy'] = 'same-origin-allow-popups'
        return response

@database_sync_to_async
def get_user_from_token(token):
            try:
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                
                # Use MongoEngine query
                user = User.objects(id=user_id).first()
                
                if user:
                    return user
                else:
                    return AnonymousUser()
            except Exception as e:
                return AnonymousUser()
class TokenAuthMiddleware:
    """
    Custom middleware that takes a token from the query string and authenticates it.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope['query_string'].decode('utf8'))
        token = query_string.get('token', [None])[0]

        if token:
            user = await get_user_from_token(token)
            scope['user'] = user
        else:
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)
