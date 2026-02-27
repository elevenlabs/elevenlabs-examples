Before writing any code, invoke the `/text-to-speech` skill to learn the correct
ElevenLabs SDK patterns.

Prerequisite: `setup.sh` has already been run. `example/` is ready with
dependencies installed.

Implement in `example/` only.

## `index.ts`

Minimal script that generates an MP3 from text using ElevenLabs Text-to-Speech.

- Load env vars from `.env`.
- Read text from CLI args; fall back to a short default sentence.
- Generate speech with `voiceId: "JBFqnCBsd6RMkjVDRZzb"` and `modelId: "eleven_multilingual_v2"`.
- Write output audio to `output.mp3`.
- Print success message with the output path.
- Handle errors with a readable message.
