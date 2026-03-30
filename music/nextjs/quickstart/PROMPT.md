Before writing any code, invoke the `/music` skill to learn the correct ElevenLabs SDK patterns.

## 1. `app/api/generate-music/route.ts`

Secure POST endpoint that generates music from a text prompt.
Never expose `ELEVENLABS_API_KEY` to the client.

- Read `{ prompt }` from the request body.
- Validate that the prompt is a non-empty string.
- Use `ElevenLabsClient` and call `client.music.compose` with `musicLengthMs: 10000`.
- Return the generated MP3 stream from the server response with an audio content type.
- Return readable JSON errors for validation and API failures.

## 2. `app/page.tsx`

Simple music playground page.

- Show a textarea for the prompt and a submit button.
- Call the API route from the client and handle loading, success, and error states.
- Convert the returned audio blob into an object URL and render an HTML audio player.
- Show a download link for the generated track once it is ready.
- Auto-clear the previous audio when starting a new request.
- Keep the UI minimal and easy to scan.
