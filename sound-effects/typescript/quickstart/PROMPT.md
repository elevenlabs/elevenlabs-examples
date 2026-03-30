Before writing any code, invoke the `/sound-effects` skill to learn the correct ElevenLabs SDK patterns.

## `index.ts`

Create a minimal script that generates a sound effect from a text prompt using the ElevenLabs JS SDK.

- Load env vars from `.env`.
- Read the sound prompt from CLI args; fall back to `Cinematic Braam, Horror`.
- Use `ElevenLabsClient` and call `client.textToSoundEffects.convert`.
- Save the returned audio stream to `output.mp3` with `Readable.fromWeb` and `pipeline`.
- Print a success message with the output path.
- Handle errors with a readable message.
