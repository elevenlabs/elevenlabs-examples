from elevenlabs.client import ElevenLabs
from typing import List, Dict, Any
from config import API_KEY
from add_pronunciation_dictionary import add_pronunciation_dictionary

def generate_and_save_audio(client: ElevenLabs, text: str, voice: str, model: str, pronunciation_dictionary_locators: List[Dict[str, Any]], file_path: str) -> str:
    audio_generator = client.generate(
        text=text,
        voice=voice,
        model=model,
        pronunciation_dictionary_locators=pronunciation_dictionary_locators
    )
    with open(file_path, "wb") as f:
        for audio_chunk in audio_generator:
            f.write(audio_chunk)
    return file_path

def pronounce_name(client: ElevenLabs, text: str, voice: str, model: str, pronunciation_file_name: str, pronunciation_file_path: str, file_path: str) -> str:
    response = add_pronunciation_dictionary(API_KEY, pronunciation_file_path, pronunciation_file_name)
    pronunciation_dictionary_id = response.get('id')
    version_id = response.get('version_id')
    
    pronunciation_dictionary_locators = [{"pronunciation_dictionary_id": pronunciation_dictionary_id, "version_id": version_id}]
    
    return generate_and_save_audio(
        client=client,
        text=text,
        voice=voice,
        model=model,
        pronunciation_dictionary_locators=pronunciation_dictionary_locators,
        file_path=file_path
    )

def main():
    client = ElevenLabs(api_key=API_KEY)
    res = pronounce_name(
        client=client,
        text="Hello Siobhan",
        voice="Rachel",
        model="eleven_turbo_v2",
        pronunciation_file_name="Name",
        pronunciation_file_path="sample_pronunciation.xml",
        file_path="name_pronunciation.mp3"
    )
if __name__ == "__main__":
   main()
