from elevenlabs.client import ElevenLabs
from elevenlabs import stream
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

    # stream
    audio_stream = client.generate(
        text="Siobhan. Aoife.",
        voice="Rachel",
        model="eleven_turbo_v2",
        stream=True
    )

    stream(audio_stream)

if __name__ == "__main__":

    load_dotenv()
    main()