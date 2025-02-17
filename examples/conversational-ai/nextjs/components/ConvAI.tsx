"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Conversation } from "@11labs/client"
import { cn } from "@/lib/utils"

async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true })
    return true
  } catch {
    console.error("Microphone permission denied")
    return false
  }
}

async function getSignedUrl(): Promise<string> {
  const response = await fetch("/api/signed-url")
  if (!response.ok) {
    throw Error("Failed to get signed url")
  }
  const data = await response.json()
  return data.signedUrl
}

export function ConvAI() {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  async function startConversation() {
    const hasPermission = await requestMicrophonePermission()
    if (!hasPermission) {
      alert("No permission")
      return
    }
    const signedUrl = await getSignedUrl()
    const conversation = await Conversation.startSession({
      signedUrl: signedUrl,
      onConnect: () => {
        setIsConnected(true)
        setIsSpeaking(true)
      },
      onDisconnect: () => {
        setIsConnected(false)
        setIsSpeaking(false)
      },
      onError: (error) => {
        console.log(error)
        alert("An error occurred during the conversation")
      },
      onModeChange: ({ mode }) => {
        setIsSpeaking(mode === "speaking")
      },
    })
    setConversation(conversation)
  }

  async function endConversation() {
    if (!conversation) {
      return
    }
    await conversation.endSession()
    setConversation(null)
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="rounded-3xl w-full max-w-2xl h-[70vh]">
        <CardContent className="flex flex-col h-full p-6">
          <div className="text-center mb-4">
            <span
              className={cn(
                "inline-block px-4 py-2 rounded-full text-sm font-medium",
                isConnected
                  ? isSpeaking
                    ? "bg-green-500/10 text-green-500"
                    : "bg-blue-500/10 text-blue-500"
                  : "bg-gray-200 text-gray-600",
              )}
            >
              {isConnected ? (isSpeaking ? "Agent Speaking" : "Agent Listening") : "Disconnected"}
            </span>
          </div>

          <div className="flex-grow flex items-center justify-center">
            {/* Nota: Esta esfera es temporal y debe ser reemplazada por un agente 3D más avanzado */}
            <div
              className={cn(
                "orb w-48 h-48",
                isSpeaking ? "animate-orb" : conversation && "animate-orb-slow",
                isConnected ? "orb-active" : "orb-inactive",
              )}
            ></div>
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant="outline"
              className="rounded-full"
              size="lg"
              disabled={conversation !== null && isConnected}
              onClick={startConversation}
            >
              Start conversation
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              size="lg"
              disabled={conversation === null && !isConnected}
              onClick={endConversation}
            >
              End conversation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

