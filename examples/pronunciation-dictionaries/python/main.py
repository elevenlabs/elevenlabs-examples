import os

import requests
from dotenv import load_dotenv
from elevenlabs import (
    BodyAddRulesToThePronunciationDictionaryV1PronunciationDictionariesPronunciationDictionaryIdAddRulesPostRulesItem_Phoneme,
    PronunciationDictionaryVersionLocator,
    play,
)
from elevenlabs.client import ElevenLabs

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

if not ELEVENLABS_API_KEY:
    raise ValueError("Missing ELEVENLABS_API_KEY")


def print_rules(client: ElevenLabs, dictionary_id: str, version_id: str):
    # TODO: replace with the SDK when fixed
    # client.pronunciation_dictionary.get_pls_file_with_a_pronunciation_dictionary_version_rules(
    #     dictionary_id=dictionary_id,
    #     version_id=version_id,
    # )
    response = requests.get(
        f"https://api.elevenlabs.io/v1/pronunciation-dictionaries/{dictionary_id}/{version_id}/download",
        headers={"xi-api-key": ELEVENLABS_API_KEY},
    )
    print("rules", response.text)


def main():
    if ELEVENLABS_API_KEY is None:
        print("Missing API KEY")
        return

    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

    with open("dictionary.pls", "rb") as f:
        # this dictionary changes how tomato is pronounced
        pronunciation_dictionary = client.pronunciation_dictionary.add_from_file(
            file=f.read(), name="example"
        )

    # TODO: fix this, fails with 307 redirect even though the URL is correct
    # client.pronunciation_dictionary.get(
    #     pronunciation_dictionary_id=pronunciation_dictionary.id
    # )

    print("-- initial rules --")
    print_rules(
        client, pronunciation_dictionary.id, pronunciation_dictionary.version_id
    )

    audio_1 = client.generate(
        text="Without the dictionary: tomato",
        voice="Rachel",
        model="eleven_turbo_v2",
    )

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

    pronunciation_dictionary_rules_removed = (
        client.pronunciation_dictionary.remove_rules_from_the_pronunciation_dictionary(
            pronunciation_dictionary_id=pronunciation_dictionary.id,
            rule_strings=["tomato", "Tomato"],
        )
    )

    print("\n\n-- removed rule --\n\n")

    print_rules(
        client,
        pronunciation_dictionary_rules_removed.id,
        pronunciation_dictionary_rules_removed.version_id,
    )

    audio_3 = client.generate(
        text="With the rule removed: tomato",
        voice="Rachel",
        model="eleven_turbo_v2",
        pronunciation_dictionary_locators=[
            PronunciationDictionaryVersionLocator(
                pronunciation_dictionary_id=pronunciation_dictionary_rules_removed.id,
                version_id=pronunciation_dictionary_rules_removed.version_id,
            )
        ],
    )

    print(pronunciation_dictionary.id)

    pronunciation_dictionary_rules_added = client.pronunciation_dictionary.add_rules_to_the_pronunciation_dictionary(
        pronunciation_dictionary_id=pronunciation_dictionary_rules_removed.id,
        rules=[
            # TODO rename this
            BodyAddRulesToThePronunciationDictionaryV1PronunciationDictionariesPronunciationDictionaryIdAddRulesPostRulesItem_Phoneme(
                type="phoneme",
                alphabet="ipa",
                string_to_replace="tomato",
                phoneme="/tə'meɪtoʊ/",
            ),
            BodyAddRulesToThePronunciationDictionaryV1PronunciationDictionariesPronunciationDictionaryIdAddRulesPostRulesItem_Phoneme(
                type="phoneme",
                alphabet="ipa",
                string_to_replace="Tomato",
                phoneme="/tə'meɪtoʊ/",
            ),
        ],
    )

    print("\n\n-- added rule --\n\n")

    print_rules(
        client,
        pronunciation_dictionary_rules_added.id,
        pronunciation_dictionary_rules_added.version_id,
    )

    audio_4 = client.generate(
        text="With the rule added again: tomato",
        voice="Rachel",
        model="eleven_turbo_v2",
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
