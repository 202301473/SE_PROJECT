from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser

from documents.mongo_client import get_all_conversations, get_conversation_by_id, save_conversation, update_conversation, delete_conversation, get_document_version_content, delete_document_version, update_share_permissions
from channels.layers import get_channel_layer # Import get_channel_layer
from asgiref.sync import async_to_sync # Import async_to_sync


from .comment_mongo_client import get_comments_for_document, add_comment, serialize_comment

@api_view(['GET', 'POST'])
@parser_classes([JSONParser])
def document_comments(request, document_id):
    if request.method == 'GET':
        try:
            comments = get_comments_for_document(document_id)
            import json
            json_comments = json.dumps(comments)
            return Response(json.loads(json_comments))
        except Exception as e:
            import traceback
            print(f"Error getting comments for document_id {document_id}: {e}")
            traceback.print_exc()
            return Response({'error': 'Failed to load comments. Please check server logs for details.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'POST':
        try:
            user = request.user.username if request.user.is_authenticated else 'anonymous'
            content = request.data.get('content')
            position = request.data.get('position')
            parent_comment_id = request.data.get('parent_comment')

            if not content:
                return Response({'error': 'Comment content is required'}, status=status.HTTP_400_BAD_REQUEST)

            new_comment_doc = add_comment(document_id, user, content, position, parent_comment_id)
            
            if new_comment_doc:
                serialized_comment = serialize_comment(new_comment_doc)
                # Send WebSocket message to the document group
                channel_layer = get_channel_layer()
                document_group_name = f'document_{document_id}'
                async_to_sync(channel_layer.group_send)(
                    document_group_name,
                    {
                        'type': 'new_comment',
                        'comment': serialized_comment
                    }
                )
                return Response(serialized_comment, status=status.HTTP_201_CREATED)
            return Response({'error': 'Failed to create comment'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(f"Error creating comment: {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def generate_share_link(request):
    """
    Generates a shareable link for a document.
    If a document_id is provided, it updates the share permissions of the existing document.
    Otherwise, it creates a new document with the provided content.
    """
    document_id = request.data.get('document_id')
    permission_level = request.data.get('permission_level', 'view')
    share_permissions = {'permission_level': permission_level}

    if document_id:
        # Update existing document
        try:
            success = update_share_permissions(document_id, share_permissions)
            if success:
                share_url = f"/documentShare/{document_id}"
                return Response({'share_url': share_url}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Failed to update share permissions'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Error generating share link: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        # Create new document
        document_content = request.data.get('document_content')
        title = request.data.get('title', 'Shared Document')

        if not document_content:
            return Response({'error': 'Document content is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            conversation_id = save_conversation(
                title=title,
                messages=[],
                initial_document_content=document_content,
                uploaded_by=(request.user.username if request.user.is_authenticated else 'anonymous'),
                notes='Shared document',
                share_permissions=share_permissions
            )
            share_url = f"/documentShare/{conversation_id}"
            return Response({'share_url': share_url}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Error generating share link: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
def conversation_list(request):
    """
    List all conversations or create a new one.
    """
    if request.method == 'GET':
        user_id = request.user.username if request.user.is_authenticated else None
        if user_id:
            conversations = get_all_conversations(user=user_id)
        else:
            # If user is not authenticated, they should not see any conversations
            conversations = []
        return Response(conversations)

    elif request.method == 'POST':
        title = request.data.get('title')
        messages = request.data.get('messages')
        initial_document_content = request.data.get('initial_document_content')
        notes = request.data.get('notes', 'Initial Version')

        print(f"[DEBUG Backend] conversation_list (POST) - Received messages: {messages}")

        if not title or not messages:
            return Response({'error': 'Title and messages are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        conversation_id = save_conversation(
            title=title,
            messages=messages,
            initial_document_content=initial_document_content,
            uploaded_by=(request.user.username if request.user.is_authenticated else 'anonymous'),
            notes=notes
        )
        if conversation_id:
            return Response({'id': conversation_id}, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': 'Failed to save conversation'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT', 'DELETE'])
def conversation_detail(request, pk):
    """
    Retrieve, update or delete a single conversation.
    """
    if request.method == 'GET':
        conversation = get_conversation_by_id(pk)
        if conversation:
            return Response(conversation)
        else:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'PUT':
        conversation = get_conversation_by_id(pk)
        if not conversation:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check for share permissions
        share_permissions = conversation.get('share_permissions')
        if share_permissions is None:
            share_permissions = {}
        permission_level = share_permissions.get('permission_level')

        # If the user is not authenticated, only allow updates if the permission level is 'edit'
        if not request.user.is_authenticated and permission_level != 'edit':
            return Response({'error': 'You do not have permission to edit this document.'}, status=status.HTTP_403_FORBIDDEN)

        title = request.data.get('title')
        messages = request.data.get('messages')
        new_document_content = request.data.get('new_document_content')
        notes = request.data.get('notes', f'Version update via AI editor')

        print(f"[DEBUG Backend] conversation_detail (PUT) - Received messages: {messages}")

        if not title: # Title is always required for a conversation
            return Response({'error': 'Title is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Fetch existing conversation to get current messages if not provided in request
        existing_conversation = get_conversation_by_id(pk)
        if not existing_conversation:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Use existing messages if not provided in the request for a title-only update
        messages_to_update = messages if messages is not None else existing_conversation.get('messages', [])

        success = update_conversation(pk, title, messages_to_update, new_document_content, uploaded_by=(request.user.username if request.user.is_authenticated else 'anonymous'), notes=notes)
        if success:
            return Response({'status': 'success'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Failed to update conversation'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'DELETE':
        success = delete_conversation(pk)
        if success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Failed to delete conversation'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_version_content(request, pk, version_number):
    """
    Retrieves the content of a specific document version from a conversation.
    """
    try:
        content = get_document_version_content(pk, version_number)
        if content is not None:
            return Response({'content': content}, status=status.HTTP_200_OK)
        return Response({'error': 'Version content not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error in get_version_content: {e}")
        return Response({'error': f'Error retrieving version content: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def version_detail(request, pk, version_number):
    """
    Delete a specific document version from a conversation.
    """
    try:
        success = delete_document_version(pk, version_number)
        if success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Failed to delete document version or version not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error deleting document version in view: {e}")
        return Response({'error': f'An error occurred: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)