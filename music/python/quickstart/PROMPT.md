Before writing any code, invoke the `/music` skill to learn the correct ElevenLabs SDK patterns.

## `main.py`

Create a minimal script that generates an MP3 music track from a text prompt using the ElevenLabs Python SDK.

- Import everything at the top. Call `load_dotenv()` after imports, then pass `api_key=os.environ["ELEVENLABS_API_KEY"]` explicitly to the `ElevenLabs` client.
- Read the prompt from CLI args; fall back to `A chill lo-fi beat with jazzy piano chords`.
- Use `client.music.compose` with `music_length_ms=10000`.
- Write the returned audio stream to `output.mp3`.
- Print a success message with the absolute output path.
- Handle missing `ELEVENLABS_API_KEY` with a readable error.
- If the API returns a copyrighted-material `bad_prompt` response, surface the suggested replacement prompt when available.
- Handle other errors with a readable message.
