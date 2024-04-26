import json
import os

from dotenv import load_dotenv

from elevenlabs.client import ElevenLabs

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

if ELEVENLABS_API_KEY is None:
    raise Exception("Missing API KEY")


def main():
    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

    # Specific voice and model identifiers
    voice_id = "21m00Tcm4TlvDq8ikWAM"
    model_id = "eleven_turbo_v2"

    # Text to save and the file name
    text_content = "Hello this is an ElevenLabs text file example using the Projects API. And this is a tomato"
    file_name = "example.txt"

    # Save the string to a text file
    with open(file_name, "w") as text_file:
        text_file.write(text_content)

    # Define the parameters for the new project
    name = "Example Text File"

    # Create the project
    with open(file_name, "rb") as file:
        project = client.projects.add(
            name=name,
            from_document=file,
            default_title_voice_id=voice_id,
            default_paragraph_voice_id=voice_id,
            default_model_id=model_id,
        )

    with open("dictionary.pls", "rb") as f:
        # this dictionary changes how tomato is pronounced
        pronunciation_dictionary = client.pronunciation_dictionary.add_from_file(
            file=f.read(), name="example"
        )

    # Create the project
    with open(file_name, "rb") as file:
        project = client.projects.add(
            name=name,
            from_document=file,
            default_title_voice_id=voice_id,
            default_paragraph_voice_id=voice_id,
            default_model_id=model_id,
            pronunciation_dictionary_locators=[
                json.dumps(
                    {
                        "pronunciation_dictionary_id": pronunciation_dictionary.id,
                        "version_id": pronunciation_dictionary.version_id,
                    }
                )
            ],
        )

    # Print the response
    print(project)


if __name__ == "__main__":
    main()
