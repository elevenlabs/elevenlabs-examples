Before writing any code, invoke the `/music` skill to learn the correct ElevenLabs SDK patterns.

## `index.ts`

Create a minimal script that generates music from a text prompt using the ElevenLabs JS SDK.

- Load env vars from `.env`.
- Read the music prompt from CLI args; fall back to `A chill lo-fi beat with jazzy piano chords`.
- Use `ElevenLabsClient` and call `client.music.compose` with `musicLengthMs: 10000`.
- Save the returned audio to `output.mp3` with `Readable.from(track)` and `pipeline`.
- Print a success message with the output path.
- Handle errors with a readable message.
