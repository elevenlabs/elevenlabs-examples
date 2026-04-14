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
    const signed = await client.conversationalAi.conversations.getSignedUrl({
      agentId: agentId.trim(),
    });
    return Response.json({ signedUrl: signed.signedUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to get signed URL";
    return Response.json({ error: message }, { status: 500 });
  }
}
