import base64
import json
import os

from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from flask import Flask
from flask_sockets import Sockets
from twilio.twiml.voice_response import Connect, VoiceResponse

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
sockets = Sockets(app)
PORT = int(os.getenv("PORT", 5000))

voice_id = "21m00Tcm4TlvDq8ikWAM"
output_format = "ulaw_8000"
text = "This is a test. You can now hang up. Thank you."


@app.route("/call/incoming", methods=["POST"])
def handle_incoming_call():
    twiml = VoiceResponse()
    connect = Connect()
    connect.stream(url=f"wss://{SERVER_DOMAIN}/call/connection")
    twiml.append(connect)
    twiml.say("The stream has started.")
    return str(twiml)


@sockets.route("/call/connection")
def handle_connection(ws):
    try:
        while not ws.closed:
            message = ws.receive()
            if message is not None:
                try:
                    data = json.loads(message)
                    if data["event"] == "start":
                        stream_sid = data.get("start", {}).get("streamSid")

                        response = client.text_to_speech.convert(
                            voice_id=voice_id,
                            output_format=output_format,
                            text=text,
                            model_id="eleven_turbo_v2",
                        )

                        audio_array_buffer = stream_to_array_buffer(response)
                        payload = base64.b64encode(audio_array_buffer).decode("utf-8")
                        ws.send(
                            json.dumps(
                                {
                                    "streamSid": stream_sid,
                                    "event": "media",
                                    "media": {"payload": payload},
                                }
                            )
                        )
                except json.JSONDecodeError as e:
                    print("Error parsing JSON:", e)
    except Exception as e:
        print(
            "Error:", e
        )  # Log any other errors that occur while processing WebSocket messages


def stream_to_array_buffer(readable_stream):
    chunks = []
    for chunk in readable_stream:
        chunks.append(chunk)
    return b"".join(chunks)


if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler

    server = pywsgi.WSGIServer(("", PORT), app, handler_class=WebSocketHandler)
    print("Server listening on: http://localhost:" + str(PORT))
    server.serve_forever()
