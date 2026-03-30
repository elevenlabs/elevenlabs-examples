Before writing any code, invoke the `/text-to-speech` skill to learn the correct ElevenLabs SDK patterns.

## 1. `app/api/isolate/route.ts`

Secure POST endpoint that accepts a FormData upload with an audio file and returns voice-isolated audio.

- Read `ELEVENLABS_API_KEY` from `process.env`. Return 500 if missing.
- Accept `audio` (File) from the request FormData. Return 400 if missing.
- Call `elevenlabs.audioIsolation.convert({ audio })`.
- Collect the returned stream into a Buffer and respond with `audio/mpeg` content type.
- Wrap in try/catch and return a JSON error on failure.

## 2. `app/page.tsx`

Voice isolator page with in-browser recording, isolation, and playback.

- Three states: idle, recording, and processing.
- **Recording:** use `navigator.mediaDevices.getUserMedia({ audio: true })` and `MediaRecorder` (prefer `audio/webm` mime type).
- Show a prominent "Record" button. While recording, show elapsed time and a pulsing red indicator. Show a "Stop" button to end recording.
- After stopping, show the original recording in an `<audio>` player and enable an "Isolate Voice" button.
- **Processing:** POST FormData with the recorded blob as `audio` to `/api/isolate`. Show a loading spinner.
- **Result:** on success, create an object URL from the response blob and render a second `<audio>` player labeled "Isolated Audio" with controls.
- Show a "Download" link for the isolated file.
- Show a "Record Again" button to reset and start over.
- Display errors inline. Handle microphone permission denial gracefully.
