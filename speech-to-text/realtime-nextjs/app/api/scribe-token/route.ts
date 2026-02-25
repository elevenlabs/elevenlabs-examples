import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ELEVENLABS_API_KEY is not set. Please add it to your .env file.",
      },
      { status: 500 }
    );
  }

  try {
    const client = new ElevenLabsClient({ apiKey });
    const token = await client.tokens.singleUse.create("realtime_scribe");
    return NextResponse.json({ token: token.token });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
