import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  console.log(params);
  console.log("Getting conversation", params.conversationId);
  if (!process.env.XI_API_KEY) {
    throw Error("XI_API_KEY is not set");
  }
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.XI_API_KEY,
  });

  try {
    const conversation = await elevenlabs.conversationalAi.getConversation(
      params.conversationId
    );
    console.log(conversation);

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Error getting conversation", error);
    return NextResponse.json(
      { error: "Failed to get Conversation" },
      { status: 500 }
    );
  }
}
