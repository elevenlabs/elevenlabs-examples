import { NextResponse } from "next/server";
import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";

function requireApiKey(): string | null {
  const key = process.env.ELEVENLABS_API_KEY;
  return key?.trim() ? key : null;
}

function apiErrorMessage(err: unknown): string {
  if (err instanceof ElevenLabsError) {
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "An unexpected error occurred.";
}

export async function GET(request: Request) {
  const apiKey = requireApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing ELEVENLABS_API_KEY. Add it to your environment." },
      { status: 500 }
    );
  }

  const agentId = new URL(request.url).searchParams.get("agentId")?.trim();
  if (!agentId) {
    return NextResponse.json(
      { error: "Missing agentId. Pass ?agentId=your-agent-id" },
      { status: 400 }
    );
  }

  try {
    const client = new ElevenLabsClient({ apiKey });
    const res = await client.conversationalAi.conversations.getWebrtcToken({
      agentId,
    });
    return NextResponse.json({ token: res.token });
  } catch (err) {
    const status =
      err instanceof ElevenLabsError && err.statusCode ? err.statusCode : 502;
    return NextResponse.json(
      { error: apiErrorMessage(err) },
      { status: status >= 400 && status < 600 ? status : 502 }
    );
  }
}
