import sys
from dotenv import load_dotenv

load_dotenv()

from elevenlabs.client import ElevenLabs

def main():
    if len(sys.argv) > 1:
        text = " ".join(sys.argv[1:])
    else:
        text = "Hello, welcome to ElevenLabs!"

    try:
        client = ElevenLabs()

        audio = client.text_to_speech.convert(
            text=text,
            voice_id="JBFqnCBsd6RMkjVDRZzb",
            model_id="eleven_multilingual_v2"
        )

        with open("output.mp3", "wb") as f:
            for chunk in audio:
                f.write(chunk)

        print(f"Success! Audio saved to output.mp3")

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
