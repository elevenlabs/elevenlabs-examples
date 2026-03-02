Before writing any code, invoke the `/speech-to-text` skill to learn the correct ElevenLabs SDK patterns.

## `main.py`

Minimal script that transcribes audio with ElevenLabs Scribe v2.

- Import everything at the top. Call `load_dotenv()` after imports, then pass `api_key=os.environ["ELEVENLABS_API_KEY"]` explicitly to the `ElevenLabs` client.
- Read first CLI arg as optional audio file path; default to `./audio.mp3`.
- Use `ElevenLabs` client and call Speech-to-Text with `model_id="scribe_v2"`.
- Print transcript text to stdout.
- Handle errors with a readable message.
