import { NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export async function GET() {
  const agentId = process.env.AGENT_ID;
  if (!agentId) {
    throw Error("AGENT_ID is not set");
  }
  try {
    const client = new ElevenLabsClient();
    const response = await client.conversationalAi.conversations.getSignedUrl({
      agentId,
    });
    return NextResponse.json({ signedUrl: response.signedUrl });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to get signed URL" },
      { status: 500 }
    );
  }
}
