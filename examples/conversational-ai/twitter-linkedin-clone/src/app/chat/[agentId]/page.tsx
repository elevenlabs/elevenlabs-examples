"use client";

import { use } from "react";
import Link from "next/link";
import ElevenLabsWidgetFixed from "@/components/ElevenLabsWidgetFixed";

export default function ChatPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-black mb-4">
            Voice Conversation
          </h1>
          <Link href="/" className="text-blue-600 hover:underline text-lg">
            ← Back to Home
          </Link>
        </div>

        <ElevenLabsWidgetFixed agentId={agentId} />
      </div>
    </div>
  );
}
