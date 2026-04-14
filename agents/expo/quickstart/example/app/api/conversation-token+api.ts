import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";

function getApiKey(): string | null {
  const key = process.env.ELEVENLABS_API_KEY;
  return key?.trim() || null;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "An unexpected error occurred.";
}

export async function GET(request: Request) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return Response.json(
      { error: "Missing ELEVENLABS_API_KEY. Add it to your environment." },
      { status: 500 },
    );
  }

  const agentId = new URL(request.url).searchParams.get("agentId")?.trim();
  if (!agentId) {
    return Response.json(
      { error: "Missing agentId. Pass ?agentId=your-agent-id" },
      { status: 400 },
    );
  }

  try {
    const client = new ElevenLabsClient({ apiKey });
    const res = await client.conversationalAi.conversations.getSignedUrl({
      agentId,
    });
    return Response.json({ signedUrl: res.signedUrl });
  } catch (err) {
    const status =
      err instanceof ElevenLabsError && err.statusCode ? err.statusCode : 502;
    return Response.json(
      { error: errorMessage(err) },
      { status: status >= 400 && status < 600 ? status : 502 },
    );
  }
}
