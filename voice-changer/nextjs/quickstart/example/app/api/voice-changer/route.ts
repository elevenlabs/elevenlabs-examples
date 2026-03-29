import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";
import { NextRequest } from "next/server";

const DEFAULT_MODEL_ID = "eleven_multilingual_sts_v2";

async function streamToBuffer(
  stream: ReadableStream<Uint8Array>
): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Buffer[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value?.length) chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Server is missing ELEVENLABS_API_KEY." },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json(
      { error: "Request body must be multipart form data." },
      { status: 400 }
    );
  }

  const audio = formData.get("audio");
  const voiceIdRaw = formData.get("voiceId");
  const modelIdRaw = formData.get("modelId");

  if (!(audio instanceof File) || audio.size === 0) {
    return Response.json(
      { error: "Missing or empty required field: audio." },
      { status: 400 }
    );
  }

  if (typeof voiceIdRaw !== "string" || voiceIdRaw.trim() === "") {
    return Response.json(
      { error: "Missing required field: voiceId." },
      { status: 400 }
    );
  }

  const voiceId = voiceIdRaw.trim();
  const modelId =
    typeof modelIdRaw === "string" && modelIdRaw.trim() !== ""
      ? modelIdRaw.trim()
      : DEFAULT_MODEL_ID;

  const client = new ElevenLabsClient({ apiKey });

  try {
    const stream = await client.speechToSpeech.convert(voiceId, {
      audio,
      modelId,
      outputFormat: "mp3_44100_128",
    });

    const buffer = await streamToBuffer(stream);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
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
      err instanceof Error ? err.message : "Failed to convert voice.";
    return Response.json({ error: message }, { status: 502 });
  }
}
