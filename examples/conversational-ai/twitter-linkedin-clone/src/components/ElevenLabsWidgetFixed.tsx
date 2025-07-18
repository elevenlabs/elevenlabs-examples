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
  );
}
