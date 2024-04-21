import os
import time

import requests
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

if ELEVENLABS_API_KEY is None:
    raise ValueError(
        "ELEVENLABS_API_KEY environment variable not found, please copy the .env.example file to .env and fill in the API key"
    )

client = ElevenLabs(api_key=ELEVENLABS_API_KEY)


def create_dub(
    file_name, format, input_file_path, output_file_path, source_lang, target_language
):
    with open(input_file_path, "rb") as audio_file:
        response = client.dubbing.dub_a_video_or_an_audio_file(
            file=(file_name, audio_file, format),
            target_lang=target_language,
            mode="automatic",
            source_lang="en",
            num_speakers=1,
            watermark=True,  # reduces the characters used
        )

    dubbing_id = response.dubbing_id

    for i in range(1000):
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
        }

        metadata = client.dubbing.get_dubbing_project_metadata(dubbing_id=dubbing_id)
        if metadata.status == "dubbed":
            # TODO: fix the response type of client.dubbing.get_dubbed_file
            response = requests.get(
                "https://api.elevenlabs.io/v1/dubbing/"
                + dubbing_id
                + "/audio/"
                + target_language,
                headers=headers,
            )

            if response.status_code == 200:
                with open(output_file_path, "wb") as file:
                    file.write(response.content)
                print("Dubbing complete and saved to dubbed_file.mp4")

            return

        elif metadata.status == "dubbing":
            print("Dubbing in progress... Will check status again in 10 seconds")
            time.sleep(10)
        else:
            print("Dubbing failed", response.json())
            return

        if i == 10:
            print("Dubbing timed out")


if __name__ == "__main__":
    input_file_path = os.path.join(os.path.dirname(__file__), "../example_speech.mp3")
    output_file_path = "dubbed_file.mp4"

    source_language = "en"
    target_language = "es"
    create_dub(
        "example_speech.mp3",
        "audio/mpeg",
        input_file_path,
        output_file_path,
        source_language,
        target_language,
    )
