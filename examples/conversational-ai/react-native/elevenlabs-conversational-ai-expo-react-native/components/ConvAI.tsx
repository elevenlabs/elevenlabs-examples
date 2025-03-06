"use dom";
import { useState, useCallback } from "react";
import { useConversation } from "@11labs/react";

async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.log(error);
    console.error("Microphone permission denied");
    return false;
  }
}

export default function DOMComponent({}: { dom: import("expo/dom").DOMProps }) {
  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: message => console.log("Message:", message),
    onError: error => console.error("Error:", error),
  });
  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        alert("No permission");
        return;
      }
      //   const signedUrl = await getSignedUrl(); TODO
      // Start the conversation with your agent
      await conversation.startSession({
        agentId: "m114rDL9DWlf0cdw68ut", // Replace with your agent ID
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div>
      <button
        disabled={conversation !== null && conversation.status === "connected"}
        onClick={startConversation}
      >
        Start conversation
      </button>
      <button
        disabled={conversation === null || conversation.status !== "connected"}
        onClick={stopConversation}
      >
        End conversation
      </button>
    </div>
  );
}
