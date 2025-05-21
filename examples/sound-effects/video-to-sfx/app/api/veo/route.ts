export const maxDuration = 120; // This function can run for a maximum of 60 seconds
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET(request: Request) {
  return new Response("Live");
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    console.log(prompt);

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    let operation = await ai.models.generateVideos({
      model: "veo-2.0-generate-001",
      prompt,
      config: {
        personGeneration: "dont_allow",
        aspectRatio: "16:9",
      },
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({
        operation: operation,
      });
    }

    const videoUrl = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUrl) throw new Error("No video URL found");
    const resp = await fetch(`${videoUrl}&key=${process.env.GEMINI_API_KEY}`); // append your API key
    return resp;
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
