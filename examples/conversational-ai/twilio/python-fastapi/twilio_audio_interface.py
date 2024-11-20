import asyncio
from typing import Callable
import queue
import threading
import base64
from elevenlabs.conversational_ai.conversation import AudioInterface
import websockets


class TwilioAudioInterface(AudioInterface):
    def __init__(self, websocket):
        self.websocket = websocket
        self.output_queue = queue.Queue()
        self.should_stop = threading.Event()
        self.stream_sid = None
        self.input_callback = None
        self.output_thread = None
        self.lock = threading.Lock()

    def start(self, input_callback: Callable[[bytes], None]):
        """Start the audio interface with the provided callback for input audio"""
        self.should_stop.clear()
        self.input_callback = input_callback
        with self.lock:
            if not self.output_thread or not self.output_thread.is_alive():
                self.output_thread = threading.Thread(target=self._output_thread)
                self.output_thread.start()

    def stop(self):
        """Stop the audio interface and clean up resources"""
        self.should_stop.set()
        with self.lock:
            if self.output_thread and self.output_thread.is_alive():
                self.output_thread.join(timeout=5.0)
                if self.output_thread.is_alive():
                    print("Warning: Output thread did not terminate properly")
                self.output_thread = None

        self.stream_sid = None
        self.input_callback = None
        self.interrupt()

    def output(self, audio: bytes):
        """Queue audio for output to Twilio
        Audio should already be in mulaw 8kHz format from ElevenLabs"""
        self.output_queue.put(audio)

    def interrupt(self):
        """Clear the output queue to stop any audio"""
        try:
            while True:
                _ = self.output_queue.get(block=False)
        except queue.Empty:
            pass

        asyncio.run(self._send_clear_message_to_twilio())

    def _output_thread(self):
        """Thread for handling audio output to Twilio"""
        while not self.should_stop.is_set():
            try:
                asyncio.run(self._send_audio_to_twilio())
            except Exception as e:
                print(f"Error in output thread: {e}")
                self.should_stop.set()

    async def _send_audio_to_twilio(self):
        try:
            audio = self.output_queue.get(timeout=0.2)
            audio_payload = base64.b64encode(audio).decode("utf-8")
            audio_delta = {
                "event": "media",
                "streamSid": self.stream_sid,
                "media": {"payload": audio_payload},
            }
            await self.websocket.send_json(audio_delta)
        except queue.Empty:
            pass
        except websockets.exceptions.ConnectionClosed:
            print("WebSocket is closed. Stopping output thread.")
            self.should_stop.set()
        except Exception as e:
            print(f"Error sending audio: {e}")

    async def _send_clear_message_to_twilio(self):
        try:
            clear_message = {"event": "clear", "streamSid": self.stream_sid}
            await self.websocket.send_json(clear_message)
        except Exception as e:
            print(f"Error sending clear message to Twilio: {e}")

    async def handle_twilio_message(self, data):
        """Handle incoming Twilio WebSocket messages."""
        try:
            if data["event"] == "start":
                self.stream_sid = data["start"]["streamSid"]
                print(f"Started stream with stream_sid: {self.stream_sid}")
            if data["event"] == "media":
                audio_data = base64.b64decode(data["media"]["payload"])
                if self.input_callback:
                    self.input_callback(audio_data)

        except websockets.exceptions.ConnectionClosed:
            self.stop()
            self.stream_sid = None
            print("WebSocket closed, stopping audio processing")
        except Exception as e:
            print(f"Error in input_callback: {e}")
