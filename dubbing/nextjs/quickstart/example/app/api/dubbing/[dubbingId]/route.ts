import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isValidId(id: string) {
  return /^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0 && id.length <= 128;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dubbingId: string }> }
) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return jsonError("Server is missing ELEVENLABS_API_KEY.", 500);
  }

  const { dubbingId } = await params;
  if (!dubbingId || !isValidId(dubbingId)) {
    return jsonError("Invalid dubbing id.", 400);
  }

  const client = new ElevenLabsClient({ apiKey });

  try {
    const meta = await client.dubbing.get(dubbingId);
    return NextResponse.json({
      status: meta.status,
      error: meta.error ?? null,
      sourceLanguage: meta.sourceLanguage ?? null,
      targetLanguages: meta.targetLanguages ?? [],
    });
  } catch (e) {
    if (e instanceof ElevenLabsError) {
      return jsonError(e.message || "Failed to fetch dubbing status.", e.statusCode ?? 502);
    }
    const message = e instanceof Error ? e.message : "Failed to fetch dubbing status.";
    return jsonError(message, 502);
  }
}
