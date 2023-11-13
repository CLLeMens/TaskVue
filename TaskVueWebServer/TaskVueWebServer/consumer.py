from channels.generic.websocket import AsyncWebsocketConsumer
import json

class TaskVueConsumer(AsyncWebsocketConsumer):

    async def websocket_connect(self, event):
        # Akzeptieren der WebSocket-Verbindung
        await self.accept()

        # Senden einer Begrüßungsnachricht an den Client
        await self.send(text_data=json.dumps({
            "message": "Hello from the server!"
        }))

    async def websocket_receive(self, event):
        # Empfangen der Nachricht vom Client
        text_data_json = json.loads(event['text'])
        message = text_data_json['message']

        # Echo: Senden der empfangenen Nachricht zurück an den Client
        await self.send(text_data=json.dumps({
            "message": message
        }))
