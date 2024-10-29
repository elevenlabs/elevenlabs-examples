"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { toast } from "sonner";

export function ShareOnXButton({ shareText }: { shareText: string }) {
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
      variant="ghost"
      size="icon"
      onClick={() => share()}
    >
      <Image
        src="/x.png"
        alt="X (formerly Twitter) logo"
        width={20}
        height={20}
        className="w-4 h-4"
      />
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
      variant="ghost"
      size="icon"
      onClick={() => copyLink()}
    >
      <Link2 className="w-4 h-4" />
    </Button>
  );
}