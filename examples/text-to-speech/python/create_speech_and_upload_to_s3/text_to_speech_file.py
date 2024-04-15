# text_to_speech_file.py

import os
import uuid
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
client = ElevenLabs(
    api_key = ELEVENLABS_API_KEY,
)

def text_to_speech_file(text, save_file_path):
    response = client.text_to_speech.convert(
        voice_id="<enter the voice id: ex. 4v7HtLWqY9rpQ7Cg2GT4>",
        optimize_streaming_latency="0",
        output_format="mp3_22050_32",
        text=text,
        model_id="<enter the model id: ex. eleven_monolingual_v1>",
        voice_settings=VoiceSettings(
            stability=1.0,
            similarity_boost=1.0,
            style=1.0,
            use_speaker_boost=True,
        ),
    )

    save_file_name = f"{uuid.uuid4()}.mp3"
    with open(save_file_path + "/" + save_file_name, 'wb') as f:
        for chunk in response:
            if chunk:
                f.write(chunk)
    
    print("A new audio file was saved successfully!")
    