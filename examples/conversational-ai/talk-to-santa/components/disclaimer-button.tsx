'use client';

import { ScrollText } from "lucide-react";
import { useRouter } from "next/navigation";

export function DisclaimerButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/disclaimer')}
      className="absolute bottom-4 left-4 flex items-center gap-1 text-xs text-white/70 hover:text-white/90 transition-colors"
    >
      <ScrollText size={14} />
      <span>Privacy Policy</span>
    </button>
  );
}