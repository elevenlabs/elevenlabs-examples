import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

export async function GET() {
  const agentId = process.env.AGENT_ID;
  if (!agentId) {
    throw Error("AGENT_ID is not set");
  }
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw Error("ELEVENLABS_API_KEY is not set");
  }
  try {
    const client = new ElevenLabsClient({ apiKey });
    const response = await client.conversationalAi.getSignedUrl({
      agent_id: agentId,
    });
    return NextResponse.json({ signedUrl: response.signed_url });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to get signed URL" },
      { status: 500 }
    );
  }
}
