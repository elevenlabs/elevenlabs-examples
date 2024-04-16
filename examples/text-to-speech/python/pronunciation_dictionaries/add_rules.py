from elevenlabs.client import ElevenLabs
from config import API_KEY

def add_rules(name: str, pronunciation: str , pronunciation_dictionary_id:str):
    client = ElevenLabs(api_key=API_KEY)
    response =  client.pronunciation_dictionary.add_rules_to_the_pronunciation_dictionary(
    pronunciation_dictionary_id= pronunciation_dictionary_id,
    rules = [
      {
        "type": "phoneme",
        "alphabet": name,
        "phoneme": pronunciation,
        "string_to_replace": name
      }
    ]
)
    return response.json()

# Usage
if __name__ == "__main__":
    name_to_add = "Aoife"
    pronunciation = "ˈiːfə" 
    add_rules(name_to_add, pronunciation, pronunciation_dictionary_id="ziA1SoaP7L9idNFg4PJf")
