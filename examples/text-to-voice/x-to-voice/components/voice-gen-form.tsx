"use client"


import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useState } from "react"
import { getXDetailsAction } from "@/app/actions/get-x-details-action"

export function VoiceGenForm() {
  const [xHandle, setXHandle] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateVoice = async () => {
    setIsLoading(true)
    try {
      const result = await getXDetailsAction({ handle: xHandle })
      console.log("X details fetched:", result)
      // Process the result here
    } catch (error) {
      console.error("Error fetching X details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">X Voice Gen</CardTitle>
        <CardDescription>
          Transform your X profile into a unique voice with ElevenLabs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="relative">
              <Image
                src="/x.png"
                alt="X (formerly Twitter) logo"
                width={20}
                height={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-53 w-5"
              />
              <Input
                id="twitter-handle"
                placeholder="@username"
                value={xHandle}
                onChange={(e) => setXHandle(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={handleGenerateVoice} disabled={xHandle.length <= 1 || isLoading}>
            {isLoading ? "Generating..." : "Generate Voice"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
