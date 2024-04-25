import os
import json
from io import BytesIO
from flask import Flask, make_response
from flask_socketio import SocketIO, emit
from elevenlabs.client import ElevenLabs
from twilio.twiml.voice_response import VoiceResponse

from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
SERVER_DOMAIN = os.getenv("SERVER_DOMAIN")

if not ELEVENLABS_API_KEY:
    raise ValueError("ELEVENLABS_API_KEY environment variable not set")

if not SERVER_DOMAIN:
    raise ValueError("SERVER_DOMAIN environment variable not set")

client = ElevenLabs(
    api_key=ELEVENLABS_API_KEY,
)

app = Flask(__name__)
socketio = SocketIO(app)
PORT = int(os.getenv("PORT", 5000))

voice_id = "21m00Tcm4TlvDq8ikWAM"
output_format = "ulaw_8000"
text = "This is a test. You can now hang up. Thank you."


@app.route("/call/incoming", methods=["POST"])
def handle_incoming_call():
    twiml = VoiceResponse()
    twiml.connect().stream(url=f"wss://{SERVER_DOMAIN}/call/connection")

    response = make_response(twiml.to_xml())
    response.headers["Content-Type"] = "text/xml"
    return response


@socketio.on("message", namespace="/call/connection")
def handle_message(data):
    message = json.loads(data)
    if message["event"] == "start" and "start" in message:
        stream_sid = message["start"]["streamSid"]

        response = client.text_to_speech.convert(
            voice_id=voice_id,
            output_format=output_format,
            model_id="eleven_turbo_v2",
            text=text,
        )

        audio_array_buffer = stream_to_array_buffer(response)

        emit(
            "media",
            {
                "streamSid": stream_sid,
                "event": "media",
                "media": {"payload": audio_array_buffer},
            },
        )


def stream_to_array_buffer(readable_stream):
    audio_stream = BytesIO()
    for chunk in readable_stream:
        if chunk:
            audio_stream.write(chunk)
    audio_stream.seek(0)

    return audio_stream


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=PORT)
