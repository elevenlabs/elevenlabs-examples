from elevenlabs.client import ElevenLabs
from typing import List, Dict, Any
from config import API_KEY

def generate_and_save_audio(text: str, voice: str, model: str, pronunciation_dictionary_locators: List[Dict[str, Any]], file_path: str) -> str:
    """
    Generates audio from the provided text using ElevenLabs API and saves it to the specified file path.

    Args:
        text (str): The text to generate audio from.
        voice (str): The voice to use for the generated audio.
        model (str): The model to use for the generated audio.
        pronunciation_dictionary_locators (List[Dict[str, Any]]): List of pronunciation dictionary locators.
        file_path (str): The file path to save the generated audio.

    Returns:
        str: The file path where the audio is saved.
    """
    # Initialize ElevenLabs client
    client = ElevenLabs(api_key=API_KEY)

    # Generate audio data
    audio_generator = client.generate(
        text=text,
        voice=voice,
        model=model,
        pronunciation_dictionary_locators=pronunciation_dictionary_locators
    )

    # Save audio to file
    with open(file_path, "wb") as f:
        for audio_chunk in audio_generator:
            f.write(audio_chunk)

    return file_path

# Usage example
file_path = "output_audio.mp3"
audio_saved_path = generate_and_save_audio(
    text="The Python programming language utilizes algorithms and machine learning to process data, creating artificial intelligence systems that drive advancements in robotics and the Internet.",
    voice="Rachel",
    model="eleven_turbo_v2",
    pronunciation_dictionary_locators=[
        {
            "pronunciation_dictionary_id": "GE3cdfoiNx7MJFG04fGO",
            "version_id": "1WjFCFXpJ6zdGzLbb6AX"
        }
    ],
    file_path=file_path
)

print("Audio saved to:", audio_saved_path)

