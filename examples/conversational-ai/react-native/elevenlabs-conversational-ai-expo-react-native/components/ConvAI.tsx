"use dom";
import { useState } from "react";
import { Conversation } from "@11labs/client";

async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch {
    console.error("Microphone permission denied");
    return false;
  }
}

export default function DOMComponent() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  async function startConversation() {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      alert("No permission");
      return;
    }
    //   const signedUrl = await getSignedUrl();
    const conversation = await Conversation.startSession({
      agentId: "m114rDL9DWlf0cdw68ut",
      onConnect: () => {
        setIsConnected(true);
        setIsSpeaking(true);
      },
      onDisconnect: () => {
        setIsConnected(false);
        setIsSpeaking(false);
      },
      onError: error => {
        console.log(error);
        alert("An error occurred during the conversation");
      },
      onModeChange: ({ mode }) => {
        setIsSpeaking(mode === "speaking");
      },
    });
    setConversation(conversation);
  }

  async function endConversation() {
    if (!conversation) {
      return;
    }
    await conversation.endSession();
    setConversation(null);
  }
  return (
    <div>
      <button
        disabled={conversation !== null && isConnected}
        onClick={startConversation}
      >
        Start conversation
      </button>
      <button
        disabled={conversation === null && !isConnected}
        onClick={endConversation}
      >
        End conversation
      </button>
    </div>
  );
}
