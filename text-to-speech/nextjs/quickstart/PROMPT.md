Before writing any code, invoke the `/text-to-speech` skill to learn the correct ElevenLabs SDK patterns.

## 1. `app/api/generate-speech/route.ts`

Secure POST endpoint that generates speech from text.
Never expose `ELEVENLABS_API_KEY` to the client.

- Read `{ text }` from the request body.
- Validate that the text is a non-empty string.
- Use `ElevenLabsClient` and call `client.textToSpeech.convert` with `voiceId: "JBFqnCBsd6RMkjVDRZzb"` and `modelId: "eleven_multilingual_v2"`.
- Return the generated MP3 stream from the server response with an audio content type.
- Return readable JSON errors for validation and API failures.

## 2. `app/page.tsx`

Simple text-to-speech playground page.

- Show a textarea for the text input and a submit button.
- Call the API route from the client and handle loading, success, and error states.
- Convert the returned audio blob into an object URL and render an HTML audio player.
- Show a download link for the generated audio once it is ready.
- Auto-clear the previous audio when starting a new request.
- Keep the UI minimal and easy to scan.
