// TODO: switch to the elevenlabs typescript sdk
import OpenAI from "openai";

export async function GET(request: Request) {
  return new Response("Live");
}

const MAX_SFX_PROMPT_LENGTH = 200;

const generateSoundEffect = async (prompt: string) => {
  if (!process.env.ELEVENLABS_API_KEY) {
    return new Response("No API key", { status: 500 });
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
        duration_seconds: 11,
        prompt_influence: 0.3,
      },
    }),
  };
  const response = await fetch(
    "https://api.elevenlabs.io/v1/sound-generation",
    options
  );

  if (!response.ok) {
    return new Response("Failed to generate sound effect", {
      status: response.status,
    });
  }
  const blob = await response.blob();
  return new Response(blob, {
    headers: {
      "Content-Type": "audio/mpeg",
    },
  });
};

const generateCaptionForImage = async (
  imageBase64: string
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
          {
            type: "image_url",
            image_url: {
              url: `${imageBase64}`,
            },
          },
        ],
      },
    ],
  });
  const caption = response.choices[0].message.content;
  if (!caption) {
    throw new Error("Failed to generate caption");
  }
  return caption.slice(0, MAX_SFX_PROMPT_LENGTH);
};

export async function POST(request: Request) {
  const { firstFrame } = (await request.json()) as { firstFrame: string };

  let caption = "";
  try {
    caption = await generateCaptionForImage(firstFrame);
  } catch (error) {
    console.error(error);
    return new Response("Failed to generate caption", {
      status: 500,
    });
  }
  console.log("caption", caption);

  try {
    return generateSoundEffect(caption);
  } catch (error) {
    return new Response("Failed to generate sound effect", {
      status: 500,
    });
  }
}
