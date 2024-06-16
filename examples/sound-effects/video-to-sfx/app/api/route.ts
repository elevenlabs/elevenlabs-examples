// TODO: switch to the elevenlabs typescript sdk
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

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
      generation_settings: {
        use_auto_duration: false,
        duration_seconds: maxDuration,
        prompt_influence: 0.3,
      },
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

const generateCaptionForImage = async (
  imagesBase64: string[]
): Promise<string> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("No API key");
  }
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Act as an expert prompt engineer
    
    Understand what's in this video and create a prompt for a video to SFX model
    
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
  const { frames, maxDuration } = (await request.json()) as RequestBody;

  const duration =
    maxDuration && maxDuration < MAX_DURATION ? maxDuration : MAX_DURATION;

  let caption = "";
  try {
    caption = await generateCaptionForImage(frames);
  } catch (error) {
    console.error(error);
    return new Response("Failed to generate caption", {
      status: 500,
    });
  }
  console.log("caption", caption);

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
      } as ResponseBody),
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
