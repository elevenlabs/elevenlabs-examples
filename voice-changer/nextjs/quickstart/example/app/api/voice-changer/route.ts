import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

const DEFAULT_MODEL_ID = "eleven_multilingual_sts_v2";

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c)));
}

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error: ELEVENLABS_API_KEY is not set." },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const audio = formData.get("audio");
  const voiceIdRaw = formData.get("voiceId");
  const modelIdRaw = formData.get("modelId");

  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "Missing or invalid audio file." }, { status: 400 });
  }

  if (typeof voiceIdRaw !== "string" || !voiceIdRaw.trim()) {
    return NextResponse.json({ error: "voiceId is required." }, { status: 400 });
  }

  const voiceId = voiceIdRaw.trim();
  const modelId =
    typeof modelIdRaw === "string" && modelIdRaw.trim()
      ? modelIdRaw.trim()
      : DEFAULT_MODEL_ID;

  const elevenlabs = new ElevenLabsClient({ apiKey });

  try {
    const audioStream = await elevenlabs.speechToSpeech.convert(voiceId, {
      audio,
      modelId,
      outputFormat: "mp3_44100_128",
    });

    const buffer = await streamToBuffer(audioStream);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buffer.length),
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Voice conversion failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
