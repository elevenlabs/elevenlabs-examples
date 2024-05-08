import os
import time

from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

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


def download_dubbed_file(dubbing_id: str, language_code: str) -> str:
    """
    Downloads the dubbed file for a given dubbing ID and language code.

    Args:
        dubbing_id: The ID of the dubbing project.
        language_code: The language code for the dubbing.

    Returns:
        The file path to the downloaded dubbed file.
    """
    dir_path = f"data/{dubbing_id}"
    os.makedirs(dir_path, exist_ok=True)

    file_path = f"{dir_path}/{language_code}.mp4"
    with open(file_path, "wb") as file:
        for chunk in client.dubbing.get_dubbed_file(dubbing_id, language_code):
            file.write(chunk)

    return file_path


def wait_for_dubbing_completion(dubbing_id: str) -> bool:
    """
    Waits for the dubbing process to complete by periodically checking the status.

    Args:
        dubbing_id (str): The dubbing project id.

    Returns:
        bool: True if the dubbing is successful, False otherwise.
    """
    MAX_ATTEMPTS = 120
    CHECK_INTERVAL = 10  # In seconds

    for _ in range(MAX_ATTEMPTS):
        metadata = client.dubbing.get_dubbing_project_metadata(dubbing_id)
        if metadata.status == "dubbed":
            return True
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
