import Link from "next/link";
import { cn } from "@/lib/utils";

export function FooterNav({className}: {className?: string}) {
  return <nav
    className={cn("w-full flex items-center justify-center py-4 px-8 gap-x-2 text-sm text-gray-600", className)}>
    <div className={"sm:flex gap-x-2 justify-center items-center hidden"}>
      <Link href={"https://elevenlabs.io/docs/voices/voice-lab/voice-design#voice-design"}>
        Voice Designer API
      </Link>
      <span>|</span>
      <Link href={"https://elevenlabs.io/docs/api-reference/text-to-speech"}>
        Text to Speech API
      </Link>
      <span>|</span>
    </div>
    <Link href={"https://elevenlabs.io/text-to-speech"}>
      Text to Speech
    </Link>
    <span>|</span>
    <Link href={"https://elevenlabs.io/voice-design"}>
      Voice Design
    </Link>
  </nav>;
}