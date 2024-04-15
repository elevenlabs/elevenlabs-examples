# text_to_speech.py

import requests
from io import BytesIO

def text_to_speech_stream(text):
    CHUNK_SIZE = "<chunk size: ex. 1024>"
    url = "https://api.elevenlabs.io/v1/text-to-speech/<voice_id>"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": "<enter your ElevenLabs API key here>"
    }
    data = {
        "text": text,
        "model_id": "<enter the model id: ex. eleven_monolingual_v1>",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5,
        }
    }

    response = requests.post(url, json=data, headers=headers, stream=True)
    audio_stream = BytesIO()
    for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
        if chunk:
            audio_stream.write(chunk)
    audio_stream.seek(0)  

    return audio_stream