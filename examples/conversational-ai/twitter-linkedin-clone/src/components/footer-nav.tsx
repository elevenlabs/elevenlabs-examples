import Link from "next/link";
import { cn } from "@/lib/utils";

export function FooterNav({ className }: { className?: string }) {
  return (
    <nav
      className={cn(
        "w-full flex items-center justify-center py-4 px-4 sm:px-8 gap-x-2 text-xs sm:text-sm text-gray-600 bg-gray-50/50 border-t border-gray-200/50 flex-wrap",
        className
      )}
    >
      <div className={"sm:flex gap-x-2 justify-center items-center hidden"}>
        <Link
          href={"https://elevenlabs.io/docs/api-reference/conversational-ai"}
          target={"_blank"}
          className="hover:text-gray-900 transition-colors"
        >
          Conversational AI API
        </Link>
        <span className="text-gray-400">|</span>
        <Link
          href={"https://elevenlabs.io/docs/api-reference/text-to-speech"}
          target={"_blank"}
          className="hover:text-gray-900 transition-colors"
        >
          Text to Speech API
        </Link>
        <span className="text-gray-400">|</span>
      </div>
      <Link
        href={"https://elevenlabs.io/text-to-speech"}
        target={"_blank"}
        className="hover:text-gray-900 transition-colors"
      >
        Text to Speech
      </Link>
      <span className="text-gray-400 mx-1">|</span>
      <Link
        href={"https://elevenlabs.io/conversational-ai"}
        target={"_blank"}
        className="hover:text-gray-900 transition-colors"
      >
        Conversational AI
      </Link>
    </nav>
  );
}
