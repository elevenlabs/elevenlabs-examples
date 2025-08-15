import os
from dotenv import load_dotenv
import websockets

import asyncio
import json
import base64


load_dotenv(".env.example")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

voice_id = 'pqHfZKP75CvOlQylNhV4' # Bill
model_id = 'eleven_turbo_v2'


async def write_to_local(audio_stream):
    """Write the audio encoded in base64 string to a local mp3 file."""

    with open('./output/test.mp3', "wb") as f:
        async for chunk in audio_stream:
            if chunk:
                f.write(chunk)


async def listen(websocket):
    """Listen to the websocket for audio data and stream it."""

    while True:
        try:
            message = await websocket.recv()
            data = json.loads(message)
            if data.get("audio"):
                yield base64.b64decode(data["audio"])
            elif data.get('isFinal'):
                break

        except websockets.exceptions.ConnectionClosed:
            print("Connection closed")
            break


async def text_to_speech_ws_streaming(voice_id, model_id):
    """Send text to ElevenLabs API and stream the returned audio."""
    uri = f"wss://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream-input?model_id={model_id}"

    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps({
            "text": " ",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "use_speaker_boost": False},
            "generation_config": {
                "chunk_length_schedule": [120, 160, 250, 290]
            },
            "xi_api_key": ELEVENLABS_API_KEY,
        }))

        # Add listen task to submit the audio chunks to the write_to_local function
        listen_task = asyncio.create_task(write_to_local(listen(websocket)))

        text = "The twilight sun cast its warm golden hues upon the vast rolling fields, saturating the landscape with an ethereal glow. Silently, the meandering brook continued its ceaseless journey, whispering secrets only the trees seemed privy to."

        await websocket.send(json.dumps({"text": text}))

        # Send empty string to indicate the end of the text sequence which will close the websocket connection
        await websocket.send(json.dumps({"text": ""}))

        await listen_task


# Main execution
if __name__ == "__main__":
    asyncio.run(text_to_speech_ws_streaming(voice_id, model_id))