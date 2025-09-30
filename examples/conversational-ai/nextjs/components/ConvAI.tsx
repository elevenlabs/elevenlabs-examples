"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversation } from "@elevenlabs/react";
import { Orb } from "@/components/ui/orb";


async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch {
    console.error("Microphone permission denied");
    return false;
  }
}

async function getSignedUrl(): Promise<string> {
  const response = await fetch("/api/signed-url");
  if (!response.ok) {
    throw Error("Failed to get signed url");
  }
  const data = await response.json();
  return data.signedUrl;
}

export function ConvAI() {
  const conversation = useConversation({
    onConnect: () => {
      console.log("connected");
    },
    onDisconnect: () => {
      console.log("disconnected");
    },
    onError: error => {
      console.log(error);
      alert("An error occurred during the conversation");
    },
    onMessage: message => {
      console.log(message);
    }
  });

  async function startConversation() {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      alert("No permission");
      return;
    }
    const signedUrl = await getSignedUrl();
    const conversationId = await conversation.startSession({
      signedUrl
    });
    console.log(conversationId);
  }


  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);


  function getAgentState() {
    if (conversation.status === "connected" && conversation.isSpeaking) {
      return "talking";
    }
    if (conversation.status === "connected") {
      return "listening";
    }
    if (conversation.status === "disconnected") {
      return null;
    }
    return null;
  }

  return (
    <div className={"flex justify-center items-center gap-x-10"}>
      <Card className={"rounded-3xl"}>
        <CardContent>
          <CardHeader>
            <CardTitle className={"text-center py-2"}>
              {conversation.status === "connected"
                ? conversation.isSpeaking
                  ? `Agent is speaking`
                  : "Agent is listening"
                : "Disconnected"}
            </CardTitle>
          </CardHeader>
          <div className={"flex flex-col gap-y-4 text-center items-center"}>
            <Orb agentState={getAgentState()} className={"w-[250px] h-[250px]"} />

            <Button
              variant={"outline"}
              className={"rounded-full"}
              size={"lg"}
              disabled={
                conversation.status !== "disconnected"
              }
              onClick={startConversation}
            >
              Start conversation
            </Button>
            <Button
              variant={"outline"}
              className={"rounded-full"}
              size={"lg"}
              disabled={conversation.status === "disconnected"}
              onClick={stopConversation}
            >
              End conversation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
