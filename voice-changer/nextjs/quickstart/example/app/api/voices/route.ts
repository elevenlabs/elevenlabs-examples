import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error: ELEVENLABS_API_KEY is not set." },
      { status: 500 }
    );
  }

  try {
    const elevenlabs = new ElevenLabsClient({ apiKey });
    const { voices } = await elevenlabs.voices.getAll();

    const body = {
      voices: voices.map((v) => ({
        voiceId: v.voiceId,
        name: v.name ?? "",
        previewUrl: v.previewUrl ?? null,
      })),
    };

    return NextResponse.json(body);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load voices.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
