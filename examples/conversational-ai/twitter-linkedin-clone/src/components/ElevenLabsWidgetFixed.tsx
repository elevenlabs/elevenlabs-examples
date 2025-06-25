"use client";

import { useEffect } from "react";

interface ElevenLabsWidgetFixedProps {
  agentId: string;
}

export default function ElevenLabsWidgetFixed({
  agentId,
}: ElevenLabsWidgetFixedProps) {
  useEffect(() => {
    // Load the ElevenLabs widget script if not already loaded
    if (
      !document.querySelector(
        'script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]'
      )
    ) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full">
      {/* Simplified information section */}
      <div className="bg-white rounded-lg border p-8 mb-8 text-center">
        <h2 className="text-2xl font-bold text-black mb-4">
          Start a Conversation
        </h2>
        <p className="text-black text-lg">
          Look for the chat widget in the bottom-right corner to begin talking.
        </p>
      </div>

      {/* Widget container - the actual widget will appear in the bottom-right corner */}
      <div
        dangerouslySetInnerHTML={{
          __html: `
            <elevenlabs-convai 
              agent-id="${agentId}"
              action-text="Start Conversation"
              start-call-text="Begin Chat"
              end-call-text="End Chat"
              listening-text="Listening..."
              speaking-text="Speaking..."
              avatar-orb-color-1="#3B82F6"
              avatar-orb-color-2="#60A5FA"
            ></elevenlabs-convai>
          `,
        }}
        suppressHydrationWarning
      />
    </div>
  );
}
