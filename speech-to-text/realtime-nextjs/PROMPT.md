Use the `speech-to-text` skill from the installed `elevenlabs/skills` package.

You are in the `speech-to-text/realtime-nextjs` project folder. Create a minimal runnable Next.js app that does real-time microphone transcription with ElevenLabs Scribe v2.

Requirements:
- Keep this example intentionally small and easy to read.
- Only create/update files inside the current folder.
- Use Next.js App Router + TypeScript.
- Use `@elevenlabs/react` `useScribe` for realtime transcription.

Create/update these files:
1. `package.json`
   - Include scripts:
     - `dev`: `next dev`
     - `build`: `next build`
     - `start`: `next start`
   - Include dependencies:
     - `@elevenlabs/elevenlabs-js`
     - `@elevenlabs/react`
     - `next`
     - `react`
     - `react-dom`
   - Include devDependencies:
     - `typescript`
     - `@types/node`
     - `@types/react`
     - `@types/react-dom`
   - Set all dependency versions to `"latest"`.
2. `.env.example`
   - Include `ELEVENLABS_API_KEY=`
3. `app/api/scribe-token/route.ts`
   - Read `ELEVENLABS_API_KEY` from env.
   - Return a helpful 500 error if missing.
   - Use `ElevenLabsClient` and create a single-use token with:
     - `client.tokens.singleUse.create("realtime_scribe")`
   - Return `{ token }` JSON.
   - Return readable 500 JSON errors on failure.
4. `app/layout.tsx`
   - Minimal layout and metadata.
5. `app/page.tsx`
   - Build a simple UI:
     - Start/Stop button
     - connected/disconnected status badge
     - live partial transcript line (italic gray)
     - committed transcript list in reverse chronological order
   - Configure `useScribe` with:
     - `modelId: "scribe_v2_realtime"`
     - `commitStrategy: CommitStrategy.VAD`
     - sensible VAD thresholds
     - microphone options (`echoCancellation`, `noiseSuppression`, `autoGainControl`)
   - On start:
     - fetch `/api/scribe-token`
     - call `scribe.connect({ token, microphone: ... })`
   - On stop:
     - call `scribe.disconnect()`
     - clear partial transcript
   - Handle normal errors with a visible error message.
   - Add an intentional-disconnect guard so this does NOT show as an app error:
     - `WebSocket closed unexpectedly: 1006 - No reason provided`
     - This should only be ignored during a brief window after a user-initiated stop.
   - In development only, prevent noisy red error overlay for that exact `1006` message during intentional stop.
   - Do NOT suppress unrelated websocket/runtime errors.
6. `README.md`
   - Short project description.
   - Setup:
     - copy `.env.example` to `.env`
     - add API key
     - run `pnpm install`
   - Run:
     - `pnpm run dev`
     - open `http://localhost:3000`
   - Usage notes:
     - Start begins live transcription
     - Stop ends session
     - intentional stop should not show the expected transient `1006` close as an app error

Acceptance checklist:
- `pnpm install` succeeds without manual edits.
- `pnpm run dev` starts and transcription works with microphone input.
- Clicking **Stop** does not show the expected transient `1006` close as a user-facing error.
- Non-intentional errors still surface normally.
