from elevenlabs.client import ElevenLabs
from elevenlabs import play, PronunciationDictionaryVersionLocator
from elevenlabs.types import AddPronunciationDictionaryResponseModel
from dotenv import load_dotenv

import os

def main():
    API_KEY = os.getenv("ELEVEN_API_KEY")

    if API_KEY is None:
        print("Missing API KEY")
        return
    
        
    client = ElevenLabs(
        api_key=API_KEY
    )
    
    f = open("rule.pls", "rb")

    rule = f.read()

    f.close()

    response: AddPronunciationDictionaryResponseModel = client.pronunciation_dictionary.add_from_file(
        file=rule,
        name="example"
    )
    
    audio = client.generate(
        text="Siobhan. Aoife.",
        voice="Rachel",
        model="eleven_turbo_v2",
        pronunciation_dictionary_locators=[
            PronunciationDictionaryVersionLocator(
                pronunciation_dictionary_id=response.id,
                version_id=response.version_id
            )
        ],
    )

    # play
    play(audio)

if __name__ == "__main__":

    load_dotenv()
    main()