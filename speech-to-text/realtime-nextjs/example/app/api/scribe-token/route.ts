import { NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    const elevenlabs = new ElevenLabsClient({
      apiKey: apiKey,
    });

    // Create single-use token for realtime scribe
    // Returns { token: "..." } directly
    const result = await elevenlabs.tokens.singleUse.create("realtime_scribe");

    // Pass through the result directly (already contains { token: "..." })
    return NextResponse.json(result);

  } catch (error) {
    console.error("Error creating scribe token:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create scribe token"
      },
      { status: 500 }
    );
  }
}