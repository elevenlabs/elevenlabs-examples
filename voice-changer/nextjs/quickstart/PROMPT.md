Before writing any code, invoke the `/text-to-speech` skill to learn the correct ElevenLabs SDK patterns.

## 1. `app/api/voice-changer/route.ts`

Secure POST endpoint that accepts a FormData upload with an audio file, converts it using speech-to-speech, and returns the transformed audio.

- Read `ELEVENLABS_API_KEY` from `process.env`. Return 500 if missing.
- Accept `audio` (File), `voiceId` (string), and optional `modelId` (string, default `eleven_multilingual_sts_v2`) from the request FormData.
- Return 400 if `audio` or `voiceId` is missing.
- Call `elevenlabs.speechToSpeech.convert(voiceId, { audio, modelId, outputFormat: "mp3_44100_128" })`.
- Collect the returned stream into a Buffer and respond with `audio/mpeg` content type.
- Wrap in try/catch and return a JSON error on failure.

## 2. `app/api/voices/route.ts`

Secure GET endpoint that returns the list of available voices.

- Call `elevenlabs.voices.getAll()`.
- Return `voices` as JSON array with `voiceId`, `name`, and `previewUrl` fields.

## 3. `app/page.tsx`

Voice changer page with file upload, voice selection, and audio playback.

- Fetch voices from `/api/voices` on mount and populate a dropdown selector.
- Default voice: `JBFqnCBsd6RMkjVDRZzb` (George).
- File input accepts `.mp3,.wav,.m4a,.webm,.ogg` audio files.
- Show the selected file name and a "Convert" button.
- On submit, POST FormData with `audio`, `voiceId`, and `modelId` to `/api/voice-changer`.
- Show a loading spinner during conversion.
- On success, create an object URL from the response blob and render an `<audio>` player with controls.
- Show a "Download" link for the converted file.
- Display errors inline. Allow re-uploading after conversion.
