import requests

# Get metadata for a pronunciation dictionary (GET /v1/pronunciation-dictionaries/:pronunciation_dictionary_id)
response = requests.get(
    "https://api.elevenlabs.io/v1/pronunciation-dictionaries/6wdDtkYfgbKgzImFXQMM",
    headers={"xi-api-key": "33afe1de43d8565797378c1e9e85148a"},
)

print(response.json())
