import os
import time
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
if ELEVENLABS_API_KEY is None:
    raise ValueError(
        "ELEVENLABS_API_KEY environment variable not found. "
        "Please copy the .env.example file to .env and fill in the API key."
    )

client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

def create_dub_file(
    input_file_path, output_file_path, file_format, source_lang, target_language
):
    # Check file existence
    if not os.path.isfile(input_file_path):
        raise FileNotFoundError(f"The input file does not exist: {input_file_path}")

    input_file_name = os.path.basename(input_file_path)
    
    with open(input_file_path, "rb") as audio_file:
        response = client.dubbing.dub_a_video_or_an_audio_file(
            file=(input_file_name, audio_file, file_format),
            target_lang=target_language,
            mode="automatic",
            source_lang=source_lang,
            num_speakers=1,
            watermark=True,  # reduces the characters used
        )

    dubbing_id = response.dubbing_id

    MAX_ATTEMPTS = 120  # for example, if you want to wait for 20 minutes, set 120 (10s * 120 = 20 minutes)
    CHECK_INTERVAL = 10  # time in seconds to wait before checking the status again

    for attempt in range(MAX_ATTEMPTS):
        metadata = client.dubbing.get_dubbing_project_metadata(dubbing_id=dubbing_id)
        if metadata.status == "dubbed":
            response = client.dubbing.get_dubbed_file(
                dubbing_id=dubbing_id,
                language_code=target_language,
            )

            if response.status_code == 200:
                with open(output_file_path, "wb") as file:
                    file.write(response.content)
                print(f"Dubbing complete and saved to {output_file_path}.")
                return output_file_path
            else:
                print("Failed to get the dubbed file:", response.json())
                return None

        elif metadata.status == "dubbing":
            print("Dubbing in progress... Will check status again in", CHECK_INTERVAL, "seconds.")
            time.sleep(CHECK_INTERVAL)
        else:
            print("Dubbing failed:", metadata)
            return None

    print("Dubbing timed out")
    return None