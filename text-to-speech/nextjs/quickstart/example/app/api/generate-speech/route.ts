import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";
import { NextRequest } from "next/server";

const VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";
const MODEL_ID = "eleven_multilingual_v2";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || !("text" in body)) {
    return Response.json({ error: "Missing required field: text." }, { status: 400 });
  }

  const text = (body as { text: unknown }).text;
  if (typeof text !== "string" || text.trim().length === 0) {
    return Response.json(
      { error: "Text must be a non-empty string." },
      { status: 400 }
    );
  }

  const client = new ElevenLabsClient();

  try {
    const stream = await client.textToSpeech.convert(VOICE_ID, {
      text: text.trim(),
      modelId: MODEL_ID,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof ElevenLabsError) {
      const status =
        err.statusCode !== undefined && err.statusCode >= 400 && err.statusCode < 600
          ? err.statusCode
          : 502;
      return Response.json(
        { error: err.message || "The ElevenLabs API returned an error." },
        { status }
      );
    }

    const message = err instanceof Error ? err.message : "Failed to generate speech.";
    return Response.json({ error: message }, { status: 502 });
  }
}
