Before writing any code, invoke the `/speech-to-text` skill to learn the correct ElevenLabs SDK patterns.

## `index.ts`

Quickstart script that transcribes audio with ElevenLabs Scribe v2.

- Load env vars from `.env`.
- Read first CLI arg as optional audio file path; default to `./audio.mp3`.
- Use `ElevenLabsClient` and call Speech-to-Text with `modelId: "scribe_v2"`.
- Print transcript text to stdout.
- Handle errors with a readable message.
