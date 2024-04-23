import requests
import os
from elevenlabs import play
from elevenlabs.client import ElevenLabs

# Define the project ID and snapshot ID
project_id = "kXXM5cSXSbhXoUjU2b5I"  # Replace {your_project_id} with your actual project ID
snapshot_id = "OiXw76lhXDdzCgKKi3LV"

# URL for the API endpoint with placeholders filled
url = f"https://api.elevenlabs.io/v1/projects/{project_id}/snjapshots/{snapshot_id}/stream"

# Retrieve the API key from an environment variable
api_key = os.getenv('ELEVENLABS_API_KEY')

# Payload to convert to MPEG
payload = {"convert_to_mpeg": True}
headers = {
    "Content-Type": "application/json",
    "xi-api-key": api_key  # Add the API key to the headers
}

# Send the POST request
response = requests.post(url, json=payload, headers=headers)

# Print the response text

print(response.text)

# Not working
# # Play the response as audio

# client = ElevenLabs(
#   api_key=api_key
# )

# audio = client.generate(text=response.text)
# play(audio)