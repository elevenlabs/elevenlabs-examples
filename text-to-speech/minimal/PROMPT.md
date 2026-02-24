Use the `text-to-speech` skill from the installed `elevenlabs/skills` package.

You are in the `text-to-speech/minimal` project folder. Create a minimal runnable JavaScript example that generates an MP3 from text using ElevenLabs Text-to-Speech.

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
   - Read text from CLI args (fallback to a short default sentence).
   - Generate speech with:
     - `voiceId: "JBFqnCBsd6RMkjVDRZzb"`
     - `modelId: "eleven_multilingual_v2"`
   - Write output audio to `output.mp3`.
   - Print success message with output path.
   - Handle API/file errors with a readable message.
4. `README.md`
   - Short project description.
   - Setup steps:
     - copy `.env.example` to `.env`
     - add API key
     - install deps
   - Run example command with a quoted text sample.

Acceptance checklist:
- Minimal files only.
- Uses the `text-to-speech` skill patterns and ElevenLabs JS SDK.
- Running `npm start -- "Hello from ElevenLabs"` writes `output.mp3`.
