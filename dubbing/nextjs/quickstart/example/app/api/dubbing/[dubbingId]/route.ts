import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";
import { NextRequest, NextResponse } from "next/server";

function getClient(): ElevenLabsClient | null {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;
  return new ElevenLabsClient({ apiKey });
}

function isValidId(id: string): boolean {
  return id.length > 0 && id.length < 256 && !/[\\/]/.test(id);
}

function serializeError(err: unknown): { message: string; statusCode?: number } {
  if (err instanceof ElevenLabsError) {
    return { message: err.message, statusCode: err.statusCode };
  }
  if (err instanceof Error) {
    return { message: err.message };
  }
  return { message: "Unknown error" };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ dubbingId: string }> },
) {
  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: "Server is missing ELEVENLABS_API_KEY." },
      { status: 500 },
    );
  }

  const { dubbingId } = await context.params;
  if (!dubbingId || !isValidId(dubbingId)) {
    return NextResponse.json({ error: "Invalid dubbing id." }, { status: 400 });
  }

  try {
    const meta = await client.dubbing.get(dubbingId);
    return NextResponse.json({
      status: meta.status,
      error: meta.error ?? null,
      sourceLanguage: meta.sourceLanguage ?? null,
      targetLanguages: meta.targetLanguages ?? [],
    });
  } catch (err) {
    const { message, statusCode } = serializeError(err);
    const status =
      statusCode && statusCode >= 400 && statusCode < 600 ? statusCode : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
