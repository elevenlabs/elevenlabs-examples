"use server";

import { actionClient } from "@/app/actions/safe-action";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { redirect } from "next/navigation";
import { ApifyClient } from "apify-client";
import { zodResponseFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import { env } from "@/env.mjs";

const kv = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

const synthesizeRetrieveHumanSchema = z.object({
  handle: z.string(),
});

export const synthesizeHumanAction = actionClient
  .schema(synthesizeRetrieveHumanSchema)
  .action(async ({ parsedInput: { handle }, ctx: { ip } }) => {
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
        maxItems: 5,
      });

      console.info(
        `[TTV-X] Apify run created with ID: ${run.defaultDatasetId}`
      );
      const { items } = await apifyClient
        .dataset(run.defaultDatasetId)
        .listItems();

      console.info(`[TTV-X] Retrieved ${items.length} tweets for ${handle}`);
      if (items.length === 0) {
        throw new Error("No tweets found for this user");
      }

      const userProfile = items[0].author as any;
      console.info(`[TTV-X] User profile data:`, {
        name: userProfile.name,
        userName: userProfile.userName,
        followers: userProfile.followers,
      });

      const user = {
        name: userProfile.name,
        userName: userProfile.userName,
        profilePicture: userProfile.profilePicture,
        description: userProfile.description,
        location: userProfile.location,
        followers: userProfile.followers,
        following: userProfile.following,
        tweets: items.map(tweet => ({
          id: tweet.id,
          text: tweet.text,
          isRetweet: tweet.isRetweet,
          isQuote: tweet.isQuote,
          isReply: tweet.isReply,
        })),
      };

      console.info(`[TTV-X] Starting OpenAI analysis for ${handle}`);
      const openai = new OpenAI({ apiKey: env.OPEN_AI_API_KEY });
      const HumanAnalysis = z.object({
        humorousDescription: z.string(),
        age: z.string(),
        characteristics: z.array(z.string()),
        voiceFerocity: z.number(),
        voiceSarcasm: z.number(),
        voiceSassFactor: z.number(),
        textToVoicePrompt: z.string(),
        textToGenerate: z.string(),
      });
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
                      - **Characteristics**: A list of personality traits or attributes.
                      - **Specimen Metrics**:
                        - **Voice Ferocity (0-100)**: How aggressive or assertive the user's voice might be.
                        - **Sarcasm Quotient (0-100)**: Likelihood of snark or irony in vocal patterns.
                        - **Sass Factor (0-100)**: The user's flair for delivering sass.
                      - **Genesis Date**: The era or decade the user seems to belong to.
                      - **TextToVoicePrompt**: A detailed and neutral description for recreating the user's voice, focusing on tone, pitch, pace, location and other vocal qualities. Never mention their name here.
                      - **TextToGenerate**: Some demo text, to test out the new voice, as if the user was reading it themselves. Must be somewhat relevant to context and humurous. Must be between 101 & 700 characters (keep it on the shorter end, around 120 characters)
                      
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
        response_format: zodResponseFormat(HumanAnalysis, "analysis"),
      });

      const analysis = completion.choices[0].message.parsed;
      console.info(
        `[TTV-X] Human analysis complete: ${JSON.stringify(analysis)}`
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
        JSON.stringify(requestBody, null, 2)
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
        }
      );

      if (!voiceResponse.ok) {
        const errorData = await voiceResponse.json();
        console.error("[TTV-X] ElevenLabs API error:", errorData);
        throw new Error(
          `Failed to generate voice previews: ${JSON.stringify(errorData)}`
        );
      }

      const voiceResponseJson = await voiceResponse.json();
      const voices = voiceResponseJson.previews.reduce(
        (acc: Record<string, any>, preview: any, index: number) => {
          acc[`voice${index + 1}`] = preview;
          return acc;
        },
        {}
      );

      // figure out a way to store voices in Blob storage (maybe even convert to blob?) Vercel has a built-in thing for this.
      const humanSpecimen = {
        user,
        analysis,
        timestamp: new Date().toISOString(),
      };

      await kv.set(`ttv_x:${handle}`, humanSpecimen);
      redirect(`/${handle}`);
    } catch (error) {
      console.error(`[TTV-X] Error processing user ${handle}:`, error);
      throw new Error(error instanceof Error ? error.message : "Unknown error");
    }
  });

export const retrieveHumanSpecimenAction = actionClient
  .schema(synthesizeRetrieveHumanSchema)
  .action(async ({ parsedInput: { handle } }) => {
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
