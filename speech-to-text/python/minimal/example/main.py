import sys
from dotenv import load_dotenv

# Load .env before importing elevenlabs (SDK reads api_key at import time)
load_dotenv()

from elevenlabs import ElevenLabs

def main():
    # Get audio file path from CLI arg or use default
    audio_path = sys.argv[1] if len(sys.argv) > 1 else "./audio.mp3"

    try:
        # Initialize ElevenLabs client
        client = ElevenLabs()

        # Transcribe audio file
        with open(audio_path, "rb") as audio_file:
            result = client.speech_to_text.convert(
                file=audio_file,
                model_id="scribe_v2"
            )

        # Print transcript to stdout
        print(result.text)

    except FileNotFoundError:
        print(f"Error: Audio file not found: {audio_path}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: Transcription failed: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
