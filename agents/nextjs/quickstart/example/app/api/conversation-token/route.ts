import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing ELEVENLABS_API_KEY. Set it in the server environment." },
      { status: 500 },
    );
  }

  if (!agentId) {
    return NextResponse.json(
      { error: "Missing ELEVENLABS_AGENT_ID. Set it in the server environment." },
      { status: 500 },
    );
  }

  try {
    const client = new ElevenLabsClient({ apiKey });
    const { token } = await client.conversationalAi.conversations.getWebrtcToken({
      agentId,
    });
    return NextResponse.json({ token });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create conversation token.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
