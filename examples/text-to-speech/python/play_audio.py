from elevenlabs.client import ElevenLabs
from elevenlabs import play
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

    
    audio = client.generate(
        text="Siobhan. Aoife.",
        voice="Rachel",
        model="eleven_turbo_v2"
    )

    # play
    play(audio)

if __name__ == "__main__":

    load_dotenv()
    main()