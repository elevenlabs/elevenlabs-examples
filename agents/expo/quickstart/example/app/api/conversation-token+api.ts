import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export async function GET(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Missing ELEVENLABS_API_KEY" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const agentId = url.searchParams.get("agentId");
  if (!agentId?.trim()) {
    return Response.json(
      { error: "Missing agentId query parameter" },
      { status: 400 }
    );
  }

  try {
    const client = new ElevenLabsClient({ apiKey });
    const result = await client.conversationalAi.conversations.getWebrtcToken({
      agentId: agentId.trim(),
    });
    return Response.json({ token: result.token });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to get token";
    return Response.json({ error: message }, { status: 500 });
  }
}
