Before writing any code, invoke the `/speech-to-text` skill to learn the correct ElevenLabs SDK patterns.

Prerequisite: `setup.sh` has already been run. `example/` is ready with dependencies installed and a sample `audio.mp3`.

Implement in `example/` only.

## `main.py`

Minimal script that transcribes audio with ElevenLabs Scribe v2.

- Call `load_dotenv()` **before** importing `elevenlabs` (the SDK's default `api_key` parameter is evaluated at import time via `os.getenv`).
- Read first CLI arg as optional audio file path; default to `./audio.mp3`.
- Use `ElevenLabs` client and call Speech-to-Text with `model_id="scribe_v2"`.
- Print transcript text to stdout.
- Handle errors with a readable message.
