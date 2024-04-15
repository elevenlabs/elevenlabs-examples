import os
from typing import Optional, Dict, Any
from elevenlabs.pronunciation_dictionary.client import PronunciationDictionaryClient
from elevenlabs.core.client_wrapper import SyncClientWrapper
import httpx
from config import API_KEY,BASE_URL

def add_pronunciation_from_file(api_key: str, file_path: str, name: str, base_url: Optional[str] = None) -> Dict[str, Any]:
    """
    Adds a pronunciation from a file to the ElevenLabs Pronunciation Dictionary.

    Args:
        api_key (str): The API key for authentication.
        file_path (str): The path to the file containing pronunciation data.
        name (str): The name to associate with the pronunciation.
        base_url (str, optional): The base URL of the API. Defaults to None.

    Returns:
        dict: The response from the server in JSON format.
    """
    # Get base URL from environment variable or use default
    base_url = base_url or os.getenv("BASE_URL", "https://api.elevenlabs.io")

    # Create an HTTP client instance from httpx to pass to SyncClientWrapper
    httpx_client = httpx.Client()

    # Initialize the SyncClientWrapper with the httpx client
    client_wrapper = SyncClientWrapper(api_key=api_key, base_url=base_url, httpx_client=httpx_client)

    # Initialize the PronunciationDictionaryClient with the client wrapper
    dict_client = PronunciationDictionaryClient(client_wrapper=client_wrapper)

    # Open the file in binary mode and read its content
    with open(file_path, "rb") as file:
        file_data = file.read()

        # Add pronunciation from file
        response = dict_client.add_from_file(name=name, file=file_data)

    return response.json()

# Usage example
file_path = "sample_pronunciation.xml"
pronunciation_name = "sample_file"
response_json = add_pronunciation_from_file(api_key=API_KEY, file_path=file_path, name=pronunciation_name, base_url=BASE_URL)
print(response_json)
