import requests
import os

# URL for the API endpoint
url = "https://api.elevenlabs.io/v1/projects/add"

# Retrieve the API key from an environment variable
api_key = os.getenv('ELEVENLABS_API_KEY', 'default_api_key')  # Use a default or leave it to raise an error if not set

# Specific voice and model identifiers
voice_id = "21m00Tcm4TlvDq8ikWAM"
model_id = "eleven_multilingual_v2"

headers = {
    'xi-api-key': api_key,  # Use the API key from the environment variable
}

# Path to your document.pdf file
file_path = 'document.pdf'

# Do the same thing as the text file, but with the EPUB file
# Hint: make sure you have the correct MIME type for an EPUB file