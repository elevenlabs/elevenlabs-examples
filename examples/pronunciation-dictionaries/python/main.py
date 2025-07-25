import os

from dotenv import load_dotenv
from elevenlabs import (
    PronunciationDictionaryRule_Phoneme,
    PronunciationDictionaryVersionLocator,
    play,
)
from elevenlabs.client import ElevenLabs

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

if not ELEVENLABS_API_KEY:
    raise ValueError("Missing ELEVENLABS_API_KEY")


def print_rules(client: ElevenLabs, dictionary_id: str, version_id: str):
    rules = client.pronunciation_dictionary.download(
        dictionary_id=dictionary_id,
        version_id=version_id,
    )
    print("rules", rules)


def main():
    if ELEVENLABS_API_KEY is None:
        print("Missing API KEY")
        return

    elevenlabs = ElevenLabs(api_key=ELEVENLABS_API_KEY)

    model = "eleven_turbo_v2"

    with open("dictionary.pls", "rb") as f:
        # this dictionary changes how tomato is pronounced
        pronunciation_dictionary = elevenlabs.pronunciation_dictionaries.create_from_file(
            file=f.read(), name="example"
        )

    dictionary = elevenlabs.pronunciation_dictionaries.get(
        pronunciation_dictionary_id=pronunciation_dictionary.id
    )
    print("dictionary name", dictionary.name)

    print("-- initial rules --")
    print_rules(
        elevenlabs, pronunciation_dictionary.id, pronunciation_dictionary.version_id
    )

    audio_1 = elevenlabs.text_to_speech.convert(
        text="Without the dictionary: tomato",
        voice="9BWtsMINqrJLrRacOk9x",
        model=model,
    )

    audio_2 = elevenlabs.text_to_speech.convert(
        text="With the dictionary: tomato",
        voice="9BWtsMINqrJLrRacOk9x",
        model=model,
        pronunciation_dictionary_locators=[
            PronunciationDictionaryVersionLocator(
                pronunciation_dictionary_id=pronunciation_dictionary.id,
                version_id=pronunciation_dictionary.version_id,
            )
        ],
    )

    pronunciation_dictionary_rules_removed = (
        elevenlabs.pronunciation_dictionaries.rules.remove(
            pronunciation_dictionary_id=pronunciation_dictionary.id,
            rule_strings=["tomato", "Tomato"],
        )
    )

    print("\n\n-- removed rule --\n\n")

    print_rules(
        elevenlabs,
        pronunciation_dictionary_rules_removed.id,
        pronunciation_dictionary_rules_removed.version_id,
    )

    audio_3 = elevenlabs.text_to_speech.convert(
        text="With the rule removed: tomato",
        voice="9BWtsMINqrJLrRacOk9x",
        model=model,
        pronunciation_dictionary_locators=[
            PronunciationDictionaryVersionLocator(
                pronunciation_dictionary_id=pronunciation_dictionary_rules_removed.id,
                version_id=pronunciation_dictionary_rules_removed.version_id,
            )
        ],
    )

    print(pronunciation_dictionary.id)

    pronunciation_dictionary_rules_added = (
        elevenlabs.pronunciation_dictionaries.rules.add(
            pronunciation_dictionary_id=pronunciation_dictionary_rules_removed.id,
            rules=[
                PronunciationDictionaryRule_Phoneme(
                    type="phoneme",
                    alphabet="ipa",
                    string_to_replace="tomato",
                    phoneme="/tə'meɪtoʊ/",
                ),
                PronunciationDictionaryRule_Phoneme(
                    type="phoneme",
                    alphabet="ipa",
                    string_to_replace="Tomato",
                    phoneme="/tə'meɪtoʊ/",
                ),
            ],
        )
    )

    print("\n\n-- added rule --\n\n")

    print_rules(
        elevenlabs,
        pronunciation_dictionary_rules_added.id,
        pronunciation_dictionary_rules_added.version_id,
    )

    audio_4 = elevenlabs.text_to_speech.convert(
        text="With the rule added again: tomato",
        voice="9BWtsMINqrJLrRacOk9x",
        model=model,
        pronunciation_dictionary_locators=[
            PronunciationDictionaryVersionLocator(
                pronunciation_dictionary_id=pronunciation_dictionary_rules_added.id,
                version_id=pronunciation_dictionary_rules_added.version_id,
            )
        ],
    )

    play(audio_1)
    play(audio_2)
    play(audio_3)
    play(audio_4)


if __name__ == "__main__":
    main()
