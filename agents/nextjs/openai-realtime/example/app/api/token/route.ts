import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

import { sessionConfig } from "@/lib/realtime-session";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server misconfiguration: ELEVENLABS_API_KEY is not set." },
      { status: 500 }
    );
  }

  try {
    const client = new ElevenLabsClient({ apiKey });
    const secret = await client.conversationalAi.realtime.createClientSecret({
      session: sessionConfig,
      expiresAfter: { anchor: "created_at", seconds: 600 },
    });
    return NextResponse.json({ value: secret.value });
  } catch (err) {
    const status =
      err instanceof ElevenLabsError && err.statusCode ? err.statusCode : 502;
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to mint realtime token.",
      },
      { status: status >= 400 && status < 600 ? status : 502 }
    );
  }
}
