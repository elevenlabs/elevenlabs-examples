import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from elevenlabs import ElevenLabs

DEFAULT_PROMPT = "Cinematic Braam, Horror"
OUTPUT_FILE = "output.mp3"


def main() -> int:
    load_dotenv()

    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        print("Missing ELEVENLABS_API_KEY. Add it to .env before running.", file=sys.stderr)
        return 1

    prompt = " ".join(sys.argv[1:]).strip() or DEFAULT_PROMPT
    output_path = Path.cwd() / OUTPUT_FILE
    client = ElevenLabs(api_key=api_key)

    try:
        audio = client.text_to_sound_effects.convert(text=prompt)

        with output_path.open("wb") as output_file:
            for chunk in audio:
                output_file.write(chunk)

        print(f"Wrote generated sound effect to {output_path}")
        return 0
    except Exception as error:
        print(f"Sound effect generation failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
