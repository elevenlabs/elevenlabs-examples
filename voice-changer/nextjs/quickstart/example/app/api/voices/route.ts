import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Server is missing ELEVENLABS_API_KEY." },
      { status: 500 }
    );
  }

  const client = new ElevenLabsClient({ apiKey });

  try {
    const res = await client.voices.getAll();
    const voices = (res.voices ?? []).map(v => ({
      voiceId: v.voiceId,
      name: v.name ?? v.voiceId,
      previewUrl: v.previewUrl ?? null,
    }));

    return Response.json({ voices });
  } catch (err) {
    if (err instanceof ElevenLabsError) {
      const status =
        err.statusCode !== undefined &&
        err.statusCode >= 400 &&
        err.statusCode < 600
          ? err.statusCode
          : 502;
      return Response.json(
        { error: err.message || "The ElevenLabs API returned an error." },
        { status }
      );
    }

    const message =
      err instanceof Error ? err.message : "Failed to load voices.";
    return Response.json({ error: message }, { status: 502 });
  }
}
