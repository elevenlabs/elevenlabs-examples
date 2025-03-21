import { ScreenshotToSoundEffect } from "@/components/screenshot-to-sound-effect";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">
          Screenshot to Sound Effect
        </h1>
        <p className="text-center mb-8 text-muted-foreground max-w-2xl mx-auto">
          Upload a screenshot, and we'll analyze it with Google's Gemini 2.0
          Flash AI to generate a matching sound effect using ElevenLabs audio
          generation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-muted/50 p-4 rounded-lg text-center">
            <div className="font-medium mb-2">1. Upload</div>
            <p className="text-sm text-muted-foreground">
              Upload or paste a screenshot of anything you want to convert to
              sound
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg text-center">
            <div className="font-medium mb-2">2. Analyze</div>
            <p className="text-sm text-muted-foreground">
              Gemini 2.0 Flash AI analyzes the image and creates a detailed
              sound prompt
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg text-center">
            <div className="font-medium mb-2">3. Generate</div>
            <p className="text-sm text-muted-foreground">
              ElevenLabs converts the prompt into a unique sound effect
            </p>
          </div>
        </div>

        <ScreenshotToSoundEffect />
      </div>
    </main>
  );
}
