Before writing any code, invoke the `/text-to-speech` skill to learn the correct ElevenLabs SDK patterns.

## 1. `app/api/voice-changer/route.ts`

Secure POST endpoint that accepts browser-recorded audio via FormData, converts it using speech-to-speech, and returns the transformed audio.

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

Voice changer page with in-browser recording, voice selection, conversion, and audio playback.

- Fetch voices from `/api/voices` on mount and populate a dropdown selector.
- Default voice: `JBFqnCBsd6RMkjVDRZzb` (George).
- Four UI states: idle, recording, ready to convert, and converting.
- **Recording:** use `navigator.mediaDevices.getUserMedia({ audio: true })` and `MediaRecorder` (prefer `audio/webm` mime type).
- Show a prominent "Record" button. While recording, show elapsed time and a pulsing red indicator. Show a "Stop" button to end recording.
- After stopping, create an object URL for the original recording and render an `<audio>` player so the user can preview it before converting.
- Keep the voice selector visible, but disabled until a recording is available. Enable it after recording stops.
- The "Convert Voice" button must stay disabled until both a recording and voice selection are available.
- On submit, POST FormData with the recorded audio as `audio`, plus `voiceId` and `modelId`, to `/api/voice-changer`. Give the recording a filename like `recording.webm`.
- Show a loading spinner during conversion.
- On success, create an object URL from the response blob and render a second `<audio>` player labeled "Converted Audio" with controls.
- If the user changes the selected voice after a conversion, treat the converted result as stale and let them click "Convert Voice" again to generate a fresh version from the same recording.
- Show a "Download" link for the converted file.
- Show a "Record Again" button to clear both audio players and start over.
- Display errors inline. Handle microphone permission denial gracefully. Clean up media tracks and revoke object URLs when replaced or on unmount.
