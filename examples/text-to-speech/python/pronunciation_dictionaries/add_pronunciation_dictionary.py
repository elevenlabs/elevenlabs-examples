from typing import Dict, Any
from elevenlabs.client import ElevenLabs
import json

def add_pronunciation_dictionary(api_key: str, file_path: str, name: str) -> Dict[str, Any]:
    client = ElevenLabs(api_key=api_key)
    with open(file_path, "rb") as file:
        file_data = file.read()
    response = client.pronunciation_dictionary.add_from_file(name=name, file=file_data)
    return json.loads(response.json())
