Before writing any code, invoke the `/sound-effects` skill to learn the correct ElevenLabs SDK patterns.

## `main.py`

Create a minimal script that generates an MP3 sound effect from text using ElevenLabs.

- Import everything at the top. Call `load_dotenv()` after imports, then pass `api_key=os.environ["ELEVENLABS_API_KEY"]` explicitly to the `ElevenLabs` client.
- Read text from CLI args; fall back to `Cinematic Braam, Horror`.
- Use `client.text_to_sound_effects.convert`.
- Write output audio to `output.mp3`.
- Print success message with the output path.
- Handle errors with a readable message.
