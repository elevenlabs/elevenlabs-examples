import { VoiceGenForm } from "@/components/voice-generator"

export default function Home() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <VoiceGenForm />
      <div
        className="absolute inset-0 bg-contain bg-no-repeat bg-bottom opacity-30 z-[-1]"
        style={{ backgroundImage: "url('/background.png')" }}
      />
    </div >
  );
}
