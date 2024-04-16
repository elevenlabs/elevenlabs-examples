# text_to_speech_stream.py

import os
from typing import IO
from io import BytesIO
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
client = ElevenLabs(
    api_key=ELEVENLABS_API_KEY,
)


def text_to_speech_stream(text: str) -> IO[bytes]:
    """
    Converts text to speech and returns the audio data as a byte stream.

    This function invokes a text-to-speech conversion API with specified parameters, including
    voice ID and various voice settings, to generate speech from the provided text. Instead of
    saving the output to a file, it streams the audio data into a BytesIO object.

    Args:
        text (str): The text content to be converted into speech.

    Returns:
        IO[bytes]: A BytesIO stream containing the audio data.
    """
    # Perform the text-to-speech conversion
    response = client.text_to_speech.convert(
        voice_id="4v7HtLWqY9rpQ7Cg2GT4",
        optimize_streaming_latency="0",
        output_format="mp3_22050_32",
        text=text,
        model_id="eleven_multilingual_v2",
        voice_settings=VoiceSettings(
            stability=0.0,
            similarity_boost=1.0,
            style=0.0,
            use_speaker_boost=True,
        ),
    )

    # Create a BytesIO object to hold audio data
    audio_stream = BytesIO()

    # Write each chunk of audio data to the stream
    for chunk in response:
        if chunk:
            audio_stream.write(chunk)

    # Reset stream position to the beginning
    audio_stream.seek(0)

    # Return the stream for further use
    return audio_stream
