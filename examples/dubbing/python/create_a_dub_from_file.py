import os
import time
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from typing import Optional

# Load environment variables
load_dotenv()

# Retrieve the API key
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
if not ELEVENLABS_API_KEY:
    raise ValueError(
        "ELEVENLABS_API_KEY environment variable not found. "
        "Please set the API key in your environment variables."
    )

client = ElevenLabs(api_key=ELEVENLABS_API_KEY)


def create_dub_from_file(
    input_file_path: str,
    output_file_path: str,
    file_format: str,
    source_language: str,
    target_language: str,
) -> Optional[str]:
    """
    Dubs an audio or video file from one language to another and saves the output.

    Args:
        input_file_path (str): The file path of the audio or video to dub.
        output_file_path (str): The file path to save the dubbed file.
        file_format (str): The file format of the input file.
        source_language (str): The language of the input file.
        target_language (str): The target language to dub into.

    Returns:
        Optional[str]: The file path of the dubbed file or None if operation failed.
    """
    if not os.path.isfile(input_file_path):
        raise FileNotFoundError(f"The input file does not exist: {input_file_path}")

    with open(input_file_path, "rb") as audio_file:
        response = client.dubbing.dub_a_video_or_an_audio_file(
            file=(os.path.basename(input_file_path), audio_file, file_format),
            target_lang=target_language,
            mode="automatic",
            source_lang=source_language,
            num_speakers=1,
            watermark=True,  # reduces the characters used
        )

    dubbing_id = response.dubbing_id
    if wait_for_dubbing_completion(dubbing_id, target_language):
        with open(output_file_path, "wb") as file:
            file.write(response.content)
        print(f"Dubbing complete and saved to {output_file_path}.")
        return output_file_path
    else:
        return None


def wait_for_dubbing_completion(dubbing_id: str, language_code: str) -> bool:
    """
    Waits for the dubbing process to complete by periodically checking the status.

    Args:
        dubbing_id (str): The dubbing project id.
        language_code (str): The language code of the target language.

    Returns:
        bool: True if the dubbing is successful, False otherwise.
    """
    MAX_ATTEMPTS = 120
    CHECK_INTERVAL = 10  # In seconds

    for _ in range(MAX_ATTEMPTS):
        metadata = client.dubbing.get_dubbing_project_metadata(dubbing_id=dubbing_id)
        if metadata.status == "dubbed":
            response = client.dubbing.get_dubbed_file(
                dubbing_id=dubbing_id, language_code=language_code
            )
            return response.status_code == 200
        elif metadata.status == "dubbing":
            print(
                "Dubbing in progress... Will check status again in",
                CHECK_INTERVAL,
                "seconds.",
            )
            time.sleep(CHECK_INTERVAL)
        else:
            print("Dubbing failed:", metadata.error_message)
            return False

    print("Dubbing timed out")
    return False
