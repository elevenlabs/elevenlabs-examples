import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";
import { NextRequest, NextResponse } from "next/server";

function getClient(): ElevenLabsClient | null {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;
  return new ElevenLabsClient({ apiKey });
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

export async function POST(request: NextRequest) {
  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: "Server is missing ELEVENLABS_API_KEY." },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const audio = formData.get("audio");
  const targetLangRaw = formData.get("targetLang");
  const sourceLangRaw = formData.get("sourceLang");

  const targetLang =
    typeof targetLangRaw === "string" ? targetLangRaw.trim() : "";
  const sourceLang =
    typeof sourceLangRaw === "string" && sourceLangRaw.trim().length > 0
      ? sourceLangRaw.trim()
      : "auto";

  if (!targetLang) {
    return NextResponse.json({ error: "Missing targetLang." }, { status: 400 });
  }

  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json(
      { error: "Missing or empty audio file." },
      { status: 400 },
    );
  }

  try {
    const created = await client.dubbing.create({
      file: audio,
      targetLang,
      sourceLang: sourceLang === "auto" ? undefined : sourceLang,
      name: "Browser dubbing demo",
    });

    return NextResponse.json({
      dubbingId: created.dubbingId,
      expectedDurationSec: created.expectedDurationSec,
    });
  } catch (err) {
    const { message, statusCode } = serializeError(err);
    const status =
      statusCode && statusCode >= 400 && statusCode < 600 ? statusCode : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
