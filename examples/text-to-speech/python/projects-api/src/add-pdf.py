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

# Open the PDF file in binary mode and prepare the multipart payload
with open(file_path, 'rb') as f:
    files = {
        'name': (None, 'Example Project Name'),
        'from_document': ('document.pdf', f, 'application/pdf'),
        'default_title_voice_id': (None, voice_id),
        'default_paragraph_voice_id': (None, voice_id),  # Assuming same voice_id for paragraph
        'default_model_id': (None, model_id),
    }

    # Make the POST request
    response = requests.post(url, files=files, headers=headers)

    # Print the response text
    print(response.text)