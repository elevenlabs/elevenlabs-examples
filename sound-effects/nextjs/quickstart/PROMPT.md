Before writing any code, invoke the `/sound-effects` skill to learn the correct ElevenLabs SDK patterns.

## 1. `app/api/generate-sound/route.ts`

Secure POST endpoint that generates a sound effect from a text prompt.
Never expose `ELEVENLABS_API_KEY` to the client.

- Read `{ prompt }` from the request body.
- Validate that the prompt is a non-empty string.
- Use `ElevenLabsClient` and call `client.textToSoundEffects.convert`.
- Return the generated MP3 stream from the server response.
- Return readable JSON errors for validation and API failures.

## 2. `app/page.tsx`

Simple sound-effects playground page.

- Show a textarea for the prompt and a submit button.
- Call the API route from the client and handle loading, success, and error states.
- Convert the returned audio blob into an object URL and render an HTML audio player.
- Auto-clear the previous audio when starting a new request.
- Keep the UI minimal and easy to scan.
