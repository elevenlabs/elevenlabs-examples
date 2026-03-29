import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";
import { TooEarlyError } from "@elevenlabs/elevenlabs-js/api/errors/TooEarlyError";
import { NextRequest, NextResponse } from "next/server";

function getClient(): ElevenLabsClient | null {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;
  return new ElevenLabsClient({ apiKey });
}

function isValidId(id: string): boolean {
  return id.length > 0 && id.length < 256 && !/[\\/]/.test(id);
}

function isValidLanguageCode(code: string): boolean {
  return /^[a-z]{2}(-[a-z]{2})?$/i.test(code);
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

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Buffer[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ dubbingId: string; languageCode: string }> },
) {
  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: "Server is missing ELEVENLABS_API_KEY." },
      { status: 500 },
    );
  }

  const { dubbingId, languageCode } = await context.params;
  if (!dubbingId || !isValidId(dubbingId)) {
    return NextResponse.json({ error: "Invalid dubbing id." }, { status: 400 });
  }
  if (!languageCode || !isValidLanguageCode(languageCode)) {
    return NextResponse.json({ error: "Invalid language code." }, { status: 400 });
  }

  try {
    const stream = await client.dubbing.audio.get(dubbingId, languageCode);
    const buffer = await streamToBuffer(stream);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    if (err instanceof TooEarlyError) {
      return NextResponse.json(
        { error: "Dubbed audio is not ready yet. Try again shortly." },
        { status: 425 },
      );
    }
    const { message, statusCode } = serializeError(err);
    const status =
      statusCode && statusCode >= 400 && statusCode < 600 ? statusCode : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
