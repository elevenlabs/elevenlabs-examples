Use the `speech-to-text` skill from the installed `elevenlabs/skills` package.

You are in the `speech-to-text/minimal` project folder. Create a minimal runnable JavaScript example that transcribes one local audio file with ElevenLabs Scribe v2.

Requirements:
- Keep this example intentionally small and easy to read.
- Only create/update files inside the current folder.
- Use Node.js + ESM JavaScript (no TypeScript, no frameworks).

Create these files:
1. `package.json`
   - Include scripts:
     - `start`: `node index.mjs`
   - Include dependencies:
     - `@elevenlabs/elevenlabs-js`
     - `dotenv`
2. `.env.example`
   - Include `ELEVENLABS_API_KEY=`
3. `index.mjs`
   - Load env vars from `.env`.
   - Read first CLI arg as input audio path.
   - If missing arg, print usage and exit with non-zero code.
   - Use `ElevenLabsClient` and call Speech-to-Text with:
     - `modelId: "scribe_v2"`
     - `file: createReadStream(inputPath)`
   - Print transcript text to stdout.
   - Handle API/file errors with a readable message.
4. `README.md`
   - Short project description.
   - Setup steps:
     - copy `.env.example` to `.env`
     - add API key
     - install deps
   - Run example command with a sample audio filename.

Acceptance checklist:
- Minimal files only.
- Uses the `speech-to-text` skill patterns and ElevenLabs JS SDK.
- Running `npm start -- ./audio.mp3` prints transcription text.
