import asyncio
import base64
import json
from fastapi import WebSocket
from elevenlabs.conversational_ai.conversation import AudioInterface
from starlette.websockets import WebSocketDisconnect, WebSocketState


class TwilioAudioInterface(AudioInterface):
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.input_callback = None
        self.stream_sid = None
        self.loop = asyncio.get_event_loop()

    def start(self, input_callback):
        self.input_callback = input_callback

    def stop(self):
        self.input_callback = None
        self.stream_sid = None

    def output(self, audio: bytes):
        """
        This method should return quickly and not block the calling thread.
        """
        asyncio.run_coroutine_threadsafe(self.send_audio_to_twilio(audio), self.loop)

    def interrupt(self):
        asyncio.run_coroutine_threadsafe(self.send_clear_message_to_twilio(), self.loop)

    async def send_audio_to_twilio(self, audio: bytes):
        if self.stream_sid:
            audio_payload = base64.b64encode(audio).decode("utf-8")
            audio_delta = {
                "event": "media",
                "streamSid": self.stream_sid,
                "media": {"payload": audio_payload},
            }
            try:
                if self.websocket.application_state == WebSocketState.CONNECTED:
                    await self.websocket.send_text(json.dumps(audio_delta))
            except (WebSocketDisconnect, RuntimeError):
                pass

    async def send_clear_message_to_twilio(self):
        if self.stream_sid:
            clear_message = {"event": "clear", "streamSid": self.stream_sid}
            try:
                if self.websocket.application_state == WebSocketState.CONNECTED:
                    await self.websocket.send_text(json.dumps(clear_message))
            except (WebSocketDisconnect, RuntimeError):
                pass

    async def handle_twilio_message(self, data):
        event_type = data.get("event")
        if event_type == "start":
            self.stream_sid = data["start"]["streamSid"]
        elif event_type == "media" and self.input_callback:
            audio_data = base64.b64decode(data["media"]["payload"])
            self.input_callback(audio_data)
