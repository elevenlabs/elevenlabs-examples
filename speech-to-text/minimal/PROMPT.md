Use the `speech-to-text` skill from the installed `elevenlabs/skills` package.

You are in the `speech-to-text/minimal` project folder. Create a minimal runnable TypeScript example that transcribes audio with ElevenLabs Scribe v2.

Requirements:
- Keep this example intentionally small and easy to read.
- Only create/update files inside the current folder.
- Use Node.js + TypeScript (no frameworks).

Create these files:
1. `package.json`
   - Include scripts:
     - `start`: `tsx index.ts`
   - Include dependencies:
     - `@elevenlabs/elevenlabs-js`
     - `dotenv`
   - Set dependency versions to `"latest"` (do not use stale pinned ranges)
   - Include devDependencies:
     - `tsx`
   - Set devDependency versions to `"latest"`
2. `.env.example`
   - Include `ELEVENLABS_API_KEY=`
3. `index.ts`
   - Load env vars from `.env`.
   - Read first CLI arg as optional local audio path.
   - This folder already contains `audio.mp3` (the ElevenLabs quickstart sample).
   - If no CLI arg is provided, default to local `./audio.mp3`.
   - Do not download audio in `index.ts`; use local files only.
   - Use `ElevenLabsClient` and call Speech-to-Text with:
     - `modelId: "scribe_v2"`
     - `file: createReadStream(inputPath)` where default input is local `audio.mp3`
   - Print transcript text to stdout.
   - Handle API/file errors with a readable message.
4. `README.md`
   - Short project description.
   - Setup steps:
     - copy `.env.example` to `.env`
     - add API key
     - install deps (`pnpm install`)
   - Include run examples for:
     - default quickstart sample (`pnpm run start`)
     - local file (`pnpm run start -- ./audio.mp3`)

Acceptance checklist:
- Minimal files only.
- Uses the `speech-to-text` skill patterns and ElevenLabs JS SDK.
- `pnpm install` succeeds without manual edits.
- Running `pnpm run start` transcribes the bundled local `audio.mp3` and prints transcription text.
