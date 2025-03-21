import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "No prompt provided" },
        { status: 400 }
      );
    }

    // Get the ElevenLabs API key from environment variables
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.elevenlabs.io/v1/sound-generation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: prompt,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("ElevenLabs API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate sound effect" },
        { status: response.status }
      );
    }

    // Get the audio data as an ArrayBuffer
    const audioArrayBuffer = await response.arrayBuffer();

    // Convert to base64 for sending to the client
    const audioBase64 = Buffer.from(audioArrayBuffer).toString("base64");

    // Create a data URL that can be used directly in an audio element
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error("Error generating sound:", error);
    return NextResponse.json(
      { error: "Failed to generate sound effect" },
      { status: 500 }
    );
  }
}
