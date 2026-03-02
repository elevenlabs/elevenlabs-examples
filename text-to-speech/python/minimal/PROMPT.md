Before writing any code, invoke the `/text-to-speech` skill to learn the correct ElevenLabs SDK patterns.

Prerequisite: `setup.sh` has already been run. `example/` is ready with dependencies installed.

Implement in `example/` only.

## `main.py`

Minimal script that generates an MP3 from text using ElevenLabs Text-to-Speech.

- Import everything at the top. Call `load_dotenv()` after imports, then pass `api_key=os.environ["ELEVENLABS_API_KEY"]` explicitly to the `ElevenLabs` client.
- Read text from CLI args; fall back to a short default sentence.
- Generate speech with `voice_id="JBFqnCBsd6RMkjVDRZzb"` and `model_id="eleven_multilingual_v2"`.
- Write output audio to `output.mp3`.
- Print success message with the output path.
- Handle errors with a readable message.
