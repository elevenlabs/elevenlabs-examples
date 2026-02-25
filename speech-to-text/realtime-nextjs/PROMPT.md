Use the `speech-to-text` skill from the installed `elevenlabs/skills` package.

You are in the `speech-to-text/realtime-nextjs` project folder. Create a polished Next.js app that does real-time microphone transcription with ElevenLabs Scribe v2. The UI should use Tailwind CSS and components from ElevenLabs UI (https://ui.elevenlabs.io), matching the ElevenLabs example app design with a nav bar and branded styling.

Requirements:
- Only create/update files inside the current folder.
- Use Next.js App Router + TypeScript.
- Use `@elevenlabs/react` `useScribe` for realtime transcription.
- Use ElevenLabs UI components installed via CLI (see step 2).

## Step 1: Create `package.json`

```json
{
  "name": "realtime-nextjs",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@elevenlabs/elevenlabs-js": "latest",
    "@elevenlabs/react": "latest",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "typescript": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest"
  }
}
```

## Step 2: Set up Tailwind CSS and install ElevenLabs UI components

Run these commands in order:

```bash
pnpm install
pnpm add -D tailwindcss@^3.4.1 postcss autoprefixer tailwindcss-animate
pnpm add clsx tailwind-merge class-variance-authority @radix-ui/react-slot lucide-react
npx tailwindcss init -p --ts
```

Create `components.json` for shadcn/ElevenLabs UI:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "stone",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

Create `lib/utils.ts`:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Update `tailwind.config.ts` with shadcn/ui theme (CSS variable HSL colors for background, foreground, card, primary, secondary, muted, accent, destructive, border, input, ring; border radius tokens from `--radius`; `darkMode: ["class"]`; content paths for `./app/**`, `./components/**`, `./pages/**`; plugin `tailwindcss-animate`).

Create `app/globals.css` with:
- Tailwind directives (`@tailwind base/components/utilities`)
- `body { font-family: -apple-system, "system-ui", sans-serif; }`
- CSS variables in `:root` for light theme and `.dark` for dark theme (standard shadcn/ui stone palette) inside `@layer base`
- Base layer resets: `* { @apply border-border }` and `body { @apply bg-background text-foreground }`

Rename `postcss.config.js` to `postcss.config.mjs`.

Then install ElevenLabs UI components:
```bash
pnpm dlx @elevenlabs/cli@latest components add conversation voice-button
```

## Step 3: Create the remaining files

1. `.env.example` with `ELEVENLABS_API_KEY=`

2. `components/logos.tsx` — Export two SVG components:
   - `ElevenLabsLogo`: full ElevenLabs wordmark SVG (`width="694" height="90" viewBox="0 0 694 90"`, uses `currentColor`). Copy the exact SVG from `examples/conversational-ai/nextjs/components/logos.tsx`.
   - `GithubLogo`: GitHub octocat SVG (`width={96} height={96} viewBox="0 0 96 96"`, uses `currentColor`). Copy the exact SVG from the same file.
   - Both accept `{ className?: string }` prop.

3. `app/api/scribe-token/route.ts`
   - Read `ELEVENLABS_API_KEY` from env, return helpful 500 error if missing.
   - Use `ElevenLabsClient` to create a single-use token: `client.tokens.singleUse.create("realtime_scribe")`
   - Return `{ token }` JSON. Return readable 500 JSON errors on failure.

4. `app/layout.tsx` — Matching `examples/conversational-ai/nextjs/app/layout.tsx`:
   - Import `./globals.css`
   - `<html lang="en" className="h-full w-full">`
   - `<body className="antialiased w-full h-full flex flex-col">`
   - Outer `<div className="flex flex-col flex-grow w-full items-center justify-center sm:px-4">`
   - `<nav className="sm:fixed w-full top-0 left-0 grid grid-cols-2 py-4 px-8">`:
     - Left: `<Link href="/">` wrapping `<ElevenLabsLogo className="h-[15px] w-auto hover:text-gray-500" />`
     - Right: `<Link>` to `https://github.com/elevenlabs/elevenlabs-examples/tree/main/speech-to-text/realtime-nextjs` wrapping `<GithubLogo className="w-5 h-5 hover:text-gray-500 text-[#24292f]" />`
   - Render `{children}` after nav. Do NOT include BackgroundWave.

5. `app/page.tsx` — `"use client"` component using ElevenLabs UI components:
   - Import `Conversation`, `ConversationContent`, `ConversationEmptyState` from `@/components/ui/conversation`
   - Import `Button` from `@/components/ui/button`
   - Import `LiveWaveform` from `@/components/ui/live-waveform`
   - UI layout:
     ```tsx
     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
       <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-lg">
         <section className="rounded-3xl w-full border border-border/70 bg-background/95 p-6 shadow-sm">
           <header className="mb-4">
             <h1 className="text-lg font-medium">
               {isConnected ? "Transcribing" : "Disconnected"}
             </h1>
           </header>
           <div className="flex flex-col gap-4 items-center">
             {isLive && (
               <LiveWaveform active={true} mode="static" height={48} barWidth={3} fadeEdges={true} />
             )}
             <Button onClick={toggle} variant="outline" size="lg" className="rounded-full">
               {isLive ? "Stop transcription" : "Start transcription"}
             </Button>
             {error && <p className="text-sm text-destructive">{error}</p>}
             <Conversation className="h-[300px] w-full">
               <ConversationContent className="flex flex-col gap-2">
                 {committedSegments.length === 0 && !isLive && (
                   <ConversationEmptyState
                     title="No transcription yet"
                     description="Press Start to begin live transcription"
                   />
                 )}
                 {isLive && (
                   <p className="text-sm italic text-muted-foreground">
                     {partial.trim() || "Listening..."}
                   </p>
                 )}
                 {committedSegments.map((text, i) => (
                   <p key={i} className="text-sm">{text}</p>
                 ))}
               </ConversationContent>
             </Conversation>
           </div>
         </section>
       </main>
     </div>
     ```
   - Configure `useScribe` with `modelId: "scribe_v2_realtime"`, `commitStrategy: CommitStrategy.VAD`, sensible VAD thresholds.
   - On start: fetch `/api/scribe-token`, call `scribe.connect({ token, microphone: { echoCancellation, noiseSuppression, autoGainControl } })`.
   - On stop: call `scribe.disconnect()`, clear partial transcript.
   - Committed segments in reverse chronological order (newest at top).
   - Add intentional-disconnect guard: suppress `WebSocket closed unexpectedly: 1006` only during a brief window after user-initiated stop. In development only, also suppress the red error overlay for that message.

6. `README.md` — Short description, setup (copy `.env.example` to `.env`, add key, `pnpm install`), run (`pnpm dev`, open localhost:3000).

## Acceptance checklist
- `pnpm install` succeeds.
- `pnpm run dev` starts and transcription works.
- Nav bar shows ElevenLabs logo (left) and GitHub icon (right).
- Centered minimal panel with rounded-3xl corners and subtle border/shadow styling.
- Plain outline Button for Start/Stop transcription.
- LiveWaveform shown above the button when recording (no gray background).
- Transcript in scrollable Conversation component, with newest committed items shown first.
- Empty state shown when no transcription yet.
- Partial transcript in italic muted text above committed transcript items while live.
- Error messages use destructive color.
- Clicking Stop does not show the transient `1006` close as an error.
