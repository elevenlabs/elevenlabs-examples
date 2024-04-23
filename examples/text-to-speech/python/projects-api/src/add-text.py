import requests
import os

# URL for the API endpoint
url = "https://api.elevenlabs.io/v1/projects/add"

# Retrieve the API key from an environment variable
api_key = os.getenv('ELEVENLABS_API_KEY')

# Specific voice and model identifiers
voice_id = "21m00Tcm4TlvDq8ikWAM"
model_id = "eleven_multilingual_v2"

headers = {
    'xi-api-key': api_key,  # Use the API key from the environment variable
}

# Text to save and the file name
text_content = "Hello this is an ElevenLabs text file example using the Projects API."
file_name = 'example.txt'

# Save the string to a text file
with open(file_name, 'w') as text_file:
    text_file.write(text_content)

# Open the text file in binary mode and prepare the multipart payload
with open(file_name, 'rb') as f:
    files = {
        'name': (None, 'Example Text File'),
        'from_document': (file_name, f, 'text/plain'),  # Changed to text/plain for a text file
        'default_title_voice_id': (None, voice_id),
        'default_paragraph_voice_id': (None, voice_id),  # Assuming same voice_id for paragraph
        'default_model_id': (None, model_id),
    }

    # Make the POST request
    response = requests.post(url, files=files, headers=headers)

    # Print the response text
    print(response.text)