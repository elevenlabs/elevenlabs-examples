"use dom";
import { useCallback, useState } from "react";
import { useConversation } from "@11labs/react";
import tools from "../utils/tools";

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

export default function ConvAiDOMComponent({
  platform,
  get_battery_level,
  change_brightness,
  flash_screen,
}: {
  dom?: import("expo/dom").DOMProps;
  platform: string;
  get_battery_level: typeof tools.get_battery_level;
  change_brightness: typeof tools.change_brightness;
  flash_screen: typeof tools.flash_screen;
}) {
  const [message, setMessage] = useState("");
  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: message => {
      console.log("Message:", message);
      setMessage(JSON.stringify(message, null, 2));
    },
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
      console.log("calling startSession");
      await conversation.startSession({
        agentId: "GGEF0NH4DWv6fAEtCBar", // Replace with your agent ID
        dynamicVariables: {
          platform,
        },
        clientTools: {
          logMessage: async ({ message }) => {
            console.log(message);
          },
          get_battery_level,
          change_brightness,
          flash_screen,
        },
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div style={{ width: 300, height: 300 }}>
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
      <pre style={{ whiteSpace: "pre-wrap" }}>{message}</pre>
    </div>
  );
}
