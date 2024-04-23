import requests
import os

# TODO remove project_id
project_id = "kXXM5cSXSbhXoUjU2b5I" # Fill in the response of `add-text.py`

# Retrieve the API key from an environment variable
api_key = os.getenv('ELEVENLABS_API_KEY')

headers = {
    'xi-api-key': api_key,  # Use the API key from the environment variable
}

url = f"https://api.elevenlabs.io/v1/projects/{project_id}/convert"

response = requests.request("POST", url, headers=headers)

print(response.text)