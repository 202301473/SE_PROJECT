import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .comment_mongo_client import get_comments_for_document

class DocumentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.document_id = self.scope['url_route']['kwargs']['document_id']
        self.document_group_name = f'document_{self.document_id}'

        # Join document group
        await self.channel_layer.group_add(
            self.document_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave document group
        await self.channel_layer.group_discard(
            self.document_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'new_comment':
            # This part is typically handled by the HTTP POST API,
            # but if we want to create comments via WebSocket,
            # we would add logic here. For now, we'll assume comments
            # are created via HTTP and then broadcasted.
            pass
        elif message_type == 'fetch_comments':
            # Send existing comments to the newly connected client
            comments = await sync_to_async(get_comments_for_document)(self.document_id)
            await self.send(text_data=json.dumps({
                'type': 'comments_list',
                'comments': comments
            }))

    async def new_comment(self, event):
        comment = event['comment']
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'new_comment',
            'comment': comment
        }))
