from channels.generic.websocket import AsyncWebsocketConsumer
import json

class TaskVueConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        # Join the group "taskvue_group"
        await self.channel_layer.group_add(
            "taskvue_group",
            self.channel_name
        )

        # Accept the WebSocket connection
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the group "taskvue_group"
        await self.channel_layer.group_discard(
            "taskvue_group",
            self.channel_name
        )

    # Handler for messages sent from track.py
    async def send_message_to_frontend(self, event):
        # Extract the message from the event
        message = event['message']

        # Send the message to the frontend over the WebSocket connection
        await self.send(text_data=json.dumps({
            "message": message
        }))

