from elevenlabs.client import ElevenLabs
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

    print(response.dict())



if __name__ == "__main__":
    load_dotenv()
    main()