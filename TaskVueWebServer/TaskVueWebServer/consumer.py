from channels.generic.websocket import AsyncWebsocketConsumer
import json

class TaskVueConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        # Gruppe beitreten
        await self.channel_layer.group_add(
            "taskvue_group",
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Gruppe verlassen
        await self.channel_layer.group_discard(
            "taskvue_group",
            self.channel_name
        )

    # Handler für Nachrichten, die von track.py gesendet werden
    async def send_message_to_frontend(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            "message": message
        }))

