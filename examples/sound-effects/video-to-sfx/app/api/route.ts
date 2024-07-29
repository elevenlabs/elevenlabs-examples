export const maxDuration = 60; // This function can run for a maximum of 60 seconds
export const dynamic = "force-dynamic";

import {
  VideoToSFXRequestBody,
  VideoToSFXResponseBody,
} from "@/app/api/interface";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

export async function GET(request: Request) {
  return new Response("Live");
}

const MAX_SFX_PROMPT_LENGTH = 200;
const NUM_SAMPLES = 4;
const MAX_DURATION = 11;

const generateSoundEffect = async (
  prompt: string,
  maxDuration: number
): Promise<string> => {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("No API key");
  }
  const options = {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
    }),
    body: JSON.stringify({
      text: prompt,
      duration_seconds: maxDuration,
      prompt_influence: 0.3,
    }),
  };
  const response = await fetch(
    "https://api.elevenlabs.io/v1/sound-generation",
    options
  );

  if (!response.ok) {
    throw new Error("Failed to generate sound effect");
  }
  const buffer = await response.arrayBuffer(); // Get an ArrayBuffer from the response

  // Convert ArrayBuffer to base64 string
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:audio/mpeg;base64,${base64}`;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const isCaptionSafeForWork = async (caption: string): Promise<boolean> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("No API key");
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `Determine if the following caption is safe for work (SFW):

        Be very strict in what is considered appropriate and forbid anything that can be deemed as sexual, violent, or inappropriate, especially if it includes children or minors.
        
        Examples of innapropriate prompts include:

        - "Toilet flushing sounds"
        - "A young child sitting on the toilet"
        - "Bathroom ambiance with a child reading aloud from a book while sitting on the toilet."
        
        Caption: "${caption}"
        
        Respond with only "true" if the caption is safe for work and "false" if it is not.`,
      },
    ],
  });

  const result = response?.choices?.[0]?.message?.content?.trim();

  if (result !== "true" && result !== "false") {
    throw new Error("Failed to determine if the caption is safe for work");
  }

  return result === "true";
};

const generateCaptionForImage = async (
  imagesBase64: string[]
): Promise<string> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("No API key");
  }
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Understand what's in this video and create a prompt for an AI video to SFX model
    
    Give a short prompt that only include the details needed for the main sound in the video. It should be ${MAX_SFX_PROMPT_LENGTH} characters or less. Just give the prompt, don't say anything else.`,
          },
          ...imagesBase64.map(imageBase64 => ({
            type: "image_url",
            image_url: {
              url: `${imageBase64}`,
            },
          })),
        ],
      },
    ] as ChatCompletionMessageParam[],
  });
  const caption = response.choices[0].message.content;
  if (!caption) {
    throw new Error("Failed to generate caption");
  }
  return caption.slice(0, MAX_SFX_PROMPT_LENGTH);
};

export async function POST(request: Request) {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const ip = request.headers.get("x-forwarded-for");
    const MAX_PER_HOUR = 20;
    const HOUR = 60 * 60;
    const ratelimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(MAX_PER_HOUR, `${HOUR}s`),
    });

    const { success, limit, reset, remaining } = await ratelimit.limit(
      `ratelimit_${ip}`
    );

    if (!success) {
      return new Response(
        `You have reached your request limit for the hour of ${HOUR} requests. Please try again in 1 hour`,
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }
  } else {
    console.log(
      "KV_REST_API_URL and KV_REST_API_TOKEN env vars not found, not rate limiting..."
    );
  }

  const { frames, maxDuration } =
    (await request.json()) as VideoToSFXRequestBody;
  console.log("request started", frames, maxDuration);

  const duration =
    maxDuration && maxDuration < MAX_DURATION ? maxDuration : MAX_DURATION;

  let caption = "";
  try {
    caption = await generateCaptionForImage(frames);
    console.log("caption", caption);
  } catch (error) {
    console.error(error);
    return new Response("Failed to generate caption", {
      status: 500,
    });
  }
  let isSafeForWork = false;
  try {
    isSafeForWork = await isCaptionSafeForWork(caption);
    console.log("isSafeForWork", isSafeForWork);
  } catch (error) {
    console.error(error);
    return new Response("Failed to determine if prompt is safe for work", {
      status: 500,
    });
  }
  if (!isSafeForWork) {
    return new Response("Prompt is deemed inappropriate", {
      status: 500,
    });
  }
  try {
    const soundEffects: string[] = [];
    await Promise.all(
      [...Array(NUM_SAMPLES)].map(() => generateSoundEffect(caption, duration))
    ).then(results => {
      soundEffects.push(...results);
    });
    return new Response(
      JSON.stringify({
        soundEffects,
        caption,
      } as VideoToSFXResponseBody),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response("Failed to generate sound effect", {
      status: 500,
    });
  }
}
