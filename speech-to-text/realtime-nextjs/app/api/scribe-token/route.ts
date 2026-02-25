import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "ELEVENLABS_API_KEY is not set in environment variables." },
      { status: 500 }
    );
  }

  try {
    const client = new ElevenLabsClient({ apiKey });
    const tokenResponse = await client.tokens.singleUse.create(
      "realtime_scribe"
    );

    return Response.json({ token: tokenResponse.token });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate token.";
    return Response.json({ error: message }, { status: 500 });
  }
}
