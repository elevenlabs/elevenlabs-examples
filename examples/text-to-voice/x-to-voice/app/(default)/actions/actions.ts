"use server";

import { actionClient } from "@/app/(default)/actions/safe-action";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { redirect } from "next/navigation";
import { ApifyClient } from "apify-client";
import { zodResponseFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import { put } from "@vercel/blob";
import { env } from "@/env.mjs";
import { analysisSchema, humanSpecimenSchema, XProfile, xProfileSchema } from "@/app/types";

const kv = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

const synthesizeRetrieveHumanSchema = z.object({
  handle: z.string(),
});

const uploadAudio = async (buffer: Buffer) => {
  const fileBlob = new Blob([buffer], { type: "audio/mpeg" });
  const formData = new FormData();
  formData.append("file", fileBlob, "audio.mp3");
  const audioResponse = await fetch(
    "https://mercury.dev.dream-ai.com/api/v1/audio",
    {
      method: "POST",
      headers: {
        "X-API-KEY": env.HEDRA_API_KEY,
      },
      body: formData,
    },
  );
  const audioData = await audioResponse.json();
  return audioData as { url: string };
};

const uploadImage = async (imageUrl: string) => {
  const imageResponse = await fetch(imageUrl);
  const imageBlob = await imageResponse.blob();
  const formData = new FormData();
  formData.append("file", imageBlob, "image.jpg");
  const audioResponse = await fetch(
    "https://mercury.dev.dream-ai.com/api/v1/portrait",
    {
      method: "POST",
      headers: {
        "X-API-KEY": env.HEDRA_API_KEY,
      },
      body: formData,
    },
  );
  const audioData = await audioResponse.json();
  return audioData as { url: string };
};

async function createVideo(requestBody: { voiceUrl: string; avatarImage?: string; audioSource: string }) {
  const statusResponse = await fetch(
    "https://mercury.dev.dream-ai.com/api/v1/characters",
    {
      method: "POST",
      headers: {
        "X-API-KEY": env.HEDRA_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
  );
  const status = await statusResponse.json();
  return status;
}

export async function getJobStatus(jobId: string) {
  const statusResponse = await fetch(
    `https://mercury.dev.dream-ai.com/api/v1/projects/${jobId}`,
    {
      method: "GET",
      headers: {
        "X-API-KEY": env.HEDRA_API_KEY,
      },
    },
  );
  const status = await statusResponse.json();
  return status;
}

const createCharacter = async ({ voiceBuffer, profilePicture }: {
  voiceBuffer: Buffer,
  profilePicture: string
}): Promise<string | undefined> => {
  const [audioData, imageData] = await Promise.all([
    await uploadAudio(voiceBuffer),
    await uploadImage(profilePicture),
  ]);
  const voiceUrl = audioData["url"];
  const avatarImage = imageData["url"];
  const requestBody = { "audioSource": "audio", voiceUrl, avatarImage };
  const statusData = await createVideo(requestBody);
  return statusData["jobId"];
};

async function getAnalysis(user: XProfile) {
  const openai = new OpenAI({ apiKey: env.OPEN_AI_API_KEY });
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content:
          "You are an insightful analyst who humorously examines human social media behavior. While your analysis can be playful and witty, when it comes to describing the human's voice in the 'textToVoicePrompt', be as detailed and descriptive as possible, focusing on accurate vocal characteristics without any humor or alien/robot references.",
      },
      {
        role: "user",
        content: `Analyze this X (Twitter) user profile and their recent tweets. Provide a humorous perspective on their online persona, but create a detailed 'textToVoicePrompt' for voice recreation that is descriptive and free of any humorous or robotic elements. Include the following information:
                      - **Essence Description**: A short, witty summary of the user.
                      - **Age Stratum**: Estimated age range.
                      - **Characteristics**: A list of personality traits or attributes they must be funny.
                      - **Specimen Metrics**:
                        - **Voice Ferocity (0-100)**: How aggressive or assertive the user's voice might be.
                        - **Sarcasm Quotient (0-100)**: Likelihood of snark or irony in vocal patterns.
                        - **Sass Factor (0-100)**: The user's flair for delivering sass.
                      - **Genesis Date**: The era or decade the user seems to belong to.
                      - **TextToVoicePrompt**: A detailed and neutral description for recreating the user's voice, focusing on tone, pitch, pace, location, gender (important) and other vocal qualities. Exaggerate the tone based on their x profile. Never mention their name here, especially if they are famous.
                      - **TextToGenerate**: Some demo text, to test out the new voice, as if the user was reading it themselves. Must be somewhat relevant to context and humurous. Must be between 101 & 700 characters long (keep it on the shorter end, around 120 characters)
                      
                      Here is the user's data:
                      
                      Name: ${user.name}
                      Location: ${user.location}
                      Bio: ${user.description}
                      Followers: ${user.followers}
                      Following: ${user.following}
                      Recent tweets: ${user.tweets.map(t => t.text).join("\n")}
          `,
      },
    ],
    response_format: zodResponseFormat(analysisSchema, "analysis"),
  });

  const analysis = completion.choices[0].message.parsed;
  return analysis;
}

export const synthesizeHumanAction = actionClient
  .schema(synthesizeRetrieveHumanSchema)
  .action(async ({ parsedInput: { handle: inputHandle }, ctx: { ip } }) => {
    const handle = normalizeHandle(inputHandle);
    // check to ensure the profile hasn't already been synthesized
    const existingGeneration = await kv.get(`ttv_x:${handle}`);
    if (existingGeneration) {
      redirect(`/${handle}`);
    }

    // rate-limit (2 generations from the same IP every 60 seconds )
    const ratelimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(2, "60 s"),
    });
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    try {
      console.info(`[TTV-X] Starting extraction for handle: ${handle}`);
      const apifyClient = new ApifyClient({
        token: process.env.APIFY_API_KEY,
      });
      const run = await apifyClient.actor("apidojo/tweet-scraper").call({
        twitterHandles: [handle],
        maxItems: 100,
      });
      console.info(
        `[TTV-X] Apify run created with ID: ${run.defaultDatasetId}`,
      );
      const { items } = await apifyClient
        .dataset(run.defaultDatasetId)
        .listItems();

      console.info(`[TTV-X] Retrieved ${items.length} tweets for ${handle}`);
      if (items.length === 0 || items[0]?.noResults || items[0]?.error) {
        throw new Error("User not found/has no tweets");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userProfile = items[0].author as any;
      console.info(`[TTV-X] User profile data:`, {
        name: userProfile?.name || "unknown",
        userName: userProfile?.userName || "unknown",
        followers: userProfile?.followers || 0,
      });

      const user = xProfileSchema.parse({
        name: userProfile.name,
        userName: userProfile.userName,
        profilePicture: userProfile.profilePicture.replace(/_normal(?=\.\w+$)/, ""),
        description: userProfile.description,
        location: userProfile.location,
        followers: userProfile.followers,
        following: userProfile.following,
        tweets: items.slice(0, 10).map(tweet => ({
          id: tweet.id,
          text: tweet.text,
          isRetweet: tweet.isRetweet,
          isQuote: tweet.isQuote,
          isReply: tweet.isReply,
        })),
      });

      console.info(`[TTV-X] Starting OpenAI analysis for ${handle}`);
      let analysis = await getAnalysis(user);
      if (analysis.textToGenerate.length < 101 || analysis.textToGenerate.length > 700) {
        analysis = await getAnalysis(user);
      }
      console.info(
        `[TTV-X] Human analysis complete: ${JSON.stringify(analysis)}`,
      );

      if (!analysis) {
        throw new Error("Error analyzing user, please try again.");
      }

      // generate voice previews from ElevenLabs
      console.info(`[TTV-X] Generating voice previews for ${handle}`);
      const requestBody = {
        voice_description: analysis.textToVoicePrompt,
        text: analysis.textToGenerate,
      };
      console.info(
        "[TTV-X] Request body:",
        JSON.stringify(requestBody, null, 2),
      );
      const voiceResponse = await fetch(
        "https://api.elevenlabs.io/v1/text-to-voice/create-previews",
        {
          method: "POST",
          headers: {
            "xi-api-key": env.ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      const voiceRes = await voiceResponse.json();
      if (!voiceRes.previews) {
        console.error("[TTV-X] ElevenLabs API error:", voiceRes);
        throw new Error(`Failed to generate voice previews, please try again.`);
      }

      const [audioBuffer1, audioBuffer2, audioBuffer3] = [
        base64ToBuffer(voiceRes.previews[0].audio_base_64),
        base64ToBuffer(voiceRes.previews[1].audio_base_64),
        base64ToBuffer(voiceRes.previews[2].audio_base_64),
      ];

      // Upload all previews in parallel
      const [voicePreview1URL, voicePreview2URL, voicePreview3URL] =
        await Promise.all([
          uploadBase64ToBlob(
            audioBuffer1,
            `audio/${voiceRes.previews[0].generated_voice_id}.mp3`,
          ),
          uploadBase64ToBlob(
            audioBuffer2,
            `audio/${voiceRes.previews[1].generated_voice_id}.mp3`,
          ),
          uploadBase64ToBlob(
            audioBuffer3,
            `audio/${voiceRes.previews[2].generated_voice_id}.mp3`,
          ),
        ]);

      let jobId = await createCharacter({
        voiceBuffer: audioBuffer1,
        profilePicture: user.profilePicture,
      });

      if (!jobId) {
        jobId = await createCharacter({
          voiceBuffer: audioBuffer1,
          profilePicture: user.profilePicture,
        });
      }

      if (!jobId) {
        throw Error("Couldn't create character.")
      }

      const humanSpecimen = humanSpecimenSchema.parse({
        user,
        analysis,
        timestamp: new Date().toISOString(),
        voicePreviews: [voicePreview1URL, voicePreview2URL, voicePreview3URL],
        videoJobs: [jobId],
      });
      await kv.set(`ttv_x:${handle}`, humanSpecimen);
    } catch (error) {
      console.error(`[TTV-X] Error processing user ${handle}:`, error);
      throw new Error("Something went wrong! Please try again later.");
    }
    redirect(`/${handle}`);
  });

export const retrieveHumanSpecimenAction = actionClient
  .schema(synthesizeRetrieveHumanSchema)
  .action(async ({ parsedInput: { handle: inputHandle } }) => {
    const handle = normalizeHandle(inputHandle);
    console.log(handle);
    try {
      const humanSpecimen = await kv.get(`ttv_x:${handle}`);
      if (!humanSpecimen) {
        return { success: false };
      }
      return { success: true, humanSpecimen };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to retrieve user data: ${error.message}`);
      }
      throw new Error("Failed to retrieve user data: Unknown error");
    }
  });

function base64ToBuffer(base64Data: string) {
  // Remove the base64 prefix if present (if it's in the format 'data:audio/mpeg;base64,...')
  const base64WithoutPrefix = base64Data.replace(
    /^data:audio\/mpeg;base64,/,
    "",
  );

  // convert base64 string to Buffer
  const buffer = Buffer.from(base64WithoutPrefix, "base64");
  return buffer;
}

async function uploadBase64ToBlob(buffer: Buffer, filename: string) {
  // upload the buffer to Vercel Blob storage
  const { url } = await put(filename, buffer, {
    access: "public",
    contentType: "audio/mpeg",
  });

  return url;
}

// helper function to normalize handles
const normalizeHandle = (input: string): string => {
  // Remove any whitespace
  let handle = input.trim();

  // Handle URLs
  const urlPatterns = [
    /^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([^\/\?]+)/i,
    /^(?:https?:\/\/)?(?:www\.)?t\.co\/([^\/\?]+)/i,
  ];

  for (const pattern of urlPatterns) {
    const match = handle.match(pattern);
    if (match && match[1]) {
      handle = match[1];
      break;
    }
  }

  // Remove @ if present
  handle = handle.replace(/^@/, "");

  // Convert to lowercase
  handle = handle.toLowerCase();

  // Remove any remaining special characters and whitespace
  handle = handle.replace(/[^\w]/g, "");

  return handle;
};
