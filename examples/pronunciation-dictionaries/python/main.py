import os

from dotenv import load_dotenv
from elevenlabs import PronunciationDictionaryVersionLocator, play
from elevenlabs.client import ElevenLabs

load_dotenv()

API_KEY = os.getenv("ELEVENLABS_API_KEY")


def main():
    if API_KEY is None:
        print("Missing API KEY")
        return

    client = ElevenLabs(api_key=API_KEY)

    with open("dictionary.pls", "rb") as f:
        # this dictionary changes how tomato is pronounced
        pronunciation_dictionary = client.pronunciation_dictionary.add_from_file(
            file=f.read(), name="example"
        )

    audio_1 = client.generate(
        text="Without the dictionary: tomato",
        voice="Rachel",
        model="eleven_turbo_v2",
    )
    play(audio_1)

    audio_2 = client.generate(
        text="With the dictionary: tomato",
        voice="Rachel",
        model="eleven_turbo_v2",
        pronunciation_dictionary_locators=[
            PronunciationDictionaryVersionLocator(
                pronunciation_dictionary_id=pronunciation_dictionary.id,
                version_id=pronunciation_dictionary.version_id,
            )
        ],
    )

    play(audio_2)


if __name__ == "__main__":
    main()
