"use client";

import { use } from "react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ElevenLabsWidgetFixed from "@/components/ElevenLabsWidgetFixed";

export default function ChatPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Voice Conversation
        </h1>
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm touch-manipulation"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Simple card about the widget */}
      <Card className="bg-white/80 backdrop-blur-[16px] shadow-xl border border-gray-200/50">
        <CardContent className="p-6 sm:p-8 text-center space-y-3 sm:space-y-4">
          <div className="text-3xl sm:text-4xl">🎙️</div>
          <CardTitle className="text-lg sm:text-xl font-bold">
            Start a Conversation
          </CardTitle>
          <p className="text-sm sm:text-base text-muted-foreground">
            Look for the chat widget in the bottom-right corner to begin talking
            with your AI twin.
          </p>
          <div className="text-xs sm:text-sm text-muted-foreground/80">
            The conversation will start automatically when you click the widget.
          </div>
        </CardContent>
      </Card>

      {/* ElevenLabs Widget (renders in bottom-right corner) */}
      <ElevenLabsWidgetFixed agentId={agentId} />
    </div>
  );
}
