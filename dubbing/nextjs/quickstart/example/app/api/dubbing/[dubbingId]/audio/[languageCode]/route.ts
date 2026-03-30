import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isValidId(id: string) {
  return /^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0 && id.length <= 128;
}

function isValidLanguageCode(code: string) {
  return /^[a-z]{2,3}(-[a-z]{2})?$/i.test(code);
}

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c)));
}

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ dubbingId: string; languageCode: string }>;
  }
) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return jsonError("Server is missing ELEVENLABS_API_KEY.", 500);
  }

  const { dubbingId, languageCode: languageCodeRaw } = await params;
  const languageCode = decodeURIComponent(languageCodeRaw ?? "");

  if (!dubbingId || !isValidId(dubbingId)) {
    return jsonError("Invalid dubbing id.", 400);
  }
  if (!languageCode || !isValidLanguageCode(languageCode)) {
    return jsonError("Invalid language code.", 400);
  }

  const client = new ElevenLabsClient({ apiKey });

  try {
    const stream = await client.dubbing.audio.get(dubbingId, languageCode);
    const buf = await streamToBuffer(stream);
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    if (e instanceof ElevenLabsError) {
      const status = e.statusCode ?? 502;
      if (status === 425) {
        return jsonError("Dubbed audio is not ready yet.", 503);
      }
      return jsonError(
        e.message || "Failed to fetch dubbed audio.",
        status >= 400 && status < 600 ? status : 502
      );
    }
    const message = e instanceof Error ? e.message : "Failed to fetch dubbed audio.";
    return jsonError(message, 502);
  }
}
