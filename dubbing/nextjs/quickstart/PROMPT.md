Before writing any code, invoke the `/text-to-speech` skill to learn the correct ElevenLabs SDK patterns.

## 1. `app/api/dubbing/route.ts`

Secure POST endpoint that starts a dubbing job from an uploaded recording.

- Read `ELEVENLABS_API_KEY` from `process.env`. Return 500 if missing.
- Accept `audio` (File), `targetLang` (string), and optional `sourceLang` (string, default `auto`) from request `FormData`.
- Return 400 for missing or invalid audio, or a missing `targetLang`.
- Use `ElevenLabsClient` and call `client.dubbing.create({ file: audio, targetLang, sourceLang: sourceLang === "auto" ? undefined : sourceLang, name: "Browser dubbing demo" })`.
- Read the job id from the SDK response (`dubbingId`) and return JSON `{ dubbingId, expectedDurationSec }`.
- Wrap failures in readable JSON errors.

## 2. `app/api/dubbing/[dubbingId]/route.ts`

Secure GET endpoint that returns dubbing status metadata for polling.

- Read and validate `dubbingId` from the route params.
- Call `client.dubbing.get(dubbingId)`.
- Return JSON with `status`, `error`, `sourceLanguage`, and `targetLanguages`.
- Keep the response small and friendly for client polling.

## 3. `app/api/dubbing/[dubbingId]/audio/[languageCode]/route.ts`

Secure GET endpoint that proxies the dubbed audio file.

- Read and validate `dubbingId` and `languageCode` from the route params.
- Call `client.dubbing.audio.get(dubbingId, languageCode)`.
- Collect the returned stream into a `Buffer` and respond with `audio/mpeg`.
- Return readable JSON errors when the dub is not ready or fails.

## 4. `app/page.tsx`

In-browser voice recorder and dubbing page.

- Use a compact curated language list in the page: `auto` for source detection plus English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, and Hindi.
- Record from the microphone with `navigator.mediaDevices.getUserMedia({ audio: true })` and `MediaRecorder`, using a browser-supported mime type (prefer `audio/webm;codecs=opus`, then `audio/webm`, then `audio/mp4`).
- After stopping, convert the recorded blob to a WAV `File` in the browser before upload. Do not send raw `audio/webm;codecs=opus` to `/api/dubbing`, because the Dubbing API rejects that content type.
- Show clear states: idle, recording, preparing, polling, ready, and error. While recording, show elapsed time and a pulsing red indicator.
- After recording, show the original audio player plus source-language and target-language selects. Prevent choosing the same explicit source and target language.
- On **Dub Recording**, `POST` `FormData` with the converted WAV file to `/api/dubbing`.
- Poll `/api/dubbing/${dubbingId}` every 5 seconds until the status is `dubbed`; stop early and show the API error if one is returned.
- When ready, fetch `/api/dubbing/${dubbingId}/audio/${targetLang}`, create an object URL, and render a dubbed `<audio>` player with controls plus a download link.
- Add a **Record Again** button that clears timers, URLs, job state, and errors.
- Display inline errors for microphone denial, upload failures, and dubbing failures.
- Keep the UI minimal and easy to scan.
