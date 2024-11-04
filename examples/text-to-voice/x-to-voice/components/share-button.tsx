"use client";

import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { toast } from "sonner";

function XIcon({ className }: { className: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="X.com"
         className={className} fill="currentColor"><title>X</title>
      <path
        d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"></path>
    </svg>
  );
}

export function ShareOnXButton() {
  const shareText = "This is what I would sound like based on my X posts using @elevenlabsio Voice Design\n\nTry it yourself on xtovoice.com\n\n#xtovoice\n\n"
  function share() {
    const url = window.location.href;
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(
        shareText,
      )}&url=${encodeURIComponent(url)}`,
    );
  }

  return (
    <Button
      onClick={() => share()}
    >
      <XIcon className="w-4 h-4" /> Share
    </Button>
  );
}

export function CopyShareLink() {
  function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.info("Link copied to clipboard 📋");
  }

  return (
    <Button
      variant={"outline"}
      onClick={() => copyLink()}
    >
      <Link2 className="w-4 h-4" />
      Copy
    </Button>
  );
}