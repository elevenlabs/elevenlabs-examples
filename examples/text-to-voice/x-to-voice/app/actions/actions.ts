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
import { notFound } from "next/navigation";

const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"), // 2 generations from the same IP every 60 seconds
});

const synthesizeRetrieveHumanSchema = z.object({
  handle: z.string(),
});

export const synthesizeHumanAction = actionClient
  .schema(synthesizeRetrieveHumanSchema)
  .action(async ({ parsedInput: { handle }, ctx: { ip } }) => {
    // 1. check if the key already exists in Redis (user hasn't already been generated)
    const existingGeneration = await redis.get(`ttv_x:${handle}`);
    if (existingGeneration) {
      // x handle has already been synthesized, redirect.
      redirect(`/${handle}`);
    }

    // 2. check rate limit
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    try {
      // 3. scrape the user's profile
      console.info(`[TTV-X] Starting extraction for handle: ${handle}`);
      const apifyClient = new ApifyClient({
        token: process.env.APIFY_API_KEY,
      });

      // extract tweets from user
      const run = await apifyClient.actor("apidojo/tweet-scraper").call({
        twitterHandles: [handle],
        maxItems: 5,
      });

      console.info(
        `[TTV-X] Apify run created with ID: ${run.defaultDatasetId}`
      );

      // extract tweets from user
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

      const userData = {
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
        voice_Sarcasm: z.number(),
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
                        - **Voice Ferocity (0-10)**: How aggressive or assertive the user's voice might be.
                        - **Sarcasm Quotient (0-10)**: Likelihood of snark or irony in vocal patterns.
                        - **Sass Factor (0-10)**: The user's flair for delivering sass.
                      - **Genesis Date**: The era or decade the user seems to belong to.
                      - **TextToVoicePrompt**: A detailed and neutral description for recreating the user's voice, focusing on tone, pitch, pace, location and other vocal qualities. Never mention their name here.
                      - **TextToGenerate**: Some demo text, to test out the new voice, as if the user was reading it themselves. Must be somewhat relevant to context and humurous. Must be between 101 & 700 characters (keep it on the shorter end, around 120 characters)
                      
                      Here is the user's data:
                      
                      Name: ${userData.name}
                      Location: ${userData.location}
                      Bio: ${userData.description}
                      Followers: ${userData.followers}
                      Following: ${userData.following}
                      Recent tweets: ${userData.tweets
                        .map(t => t.text)
                        .join("\n")}
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

      // Generate voice previews from ElevenLabs
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

      const voicePreviews = await voiceResponse.json();
      const voicePreview = voicePreviews.previews[0];

      // // Rename the previews for easier reference
      // const voices = voicePreviews.previews.reduce(
      //   (
      //     acc: Record<string, VoicePreview>,
      //     preview: VoicePreview,
      //     index: number
      //   ) => {
      //     if (index === 0) {
      //       console.log(preview);
      //     }

      //     acc[`voice${index + 1}`] = preview;
      //     return acc;
      //   },
      //   {}
      // );

      const storedData = {
        userData,
        analysis,
        voicePreview,
        timestamp: new Date().toISOString(),
      };

      // Add debug logging
      console.log(
        "[TTV-X] About to store data:",
        JSON.stringify(storedData, null, 2)
      );

      try {
        await redis.set(`ttv_x:${handle}`, JSON.stringify(storedData));
        console.log(`[TTV-X] Successfully stored data for ${handle} in Redis`);
      } catch (storageError) {
        console.error("[TTV-X] Error storing data:", storageError);
        throw new Error(`Failed to store user data: ${storageError}`);
      }

      redirect(`/${handle}`);
    } catch (error) {
      console.error(`[TTV-X] Error processing user ${handle}:`, error);
      throw new Error(error instanceof Error ? error.message : "Unknown error");
    }
  });

export const retrieveHumanSpecimenAction = actionClient
  .schema(synthesizeRetrieveHumanSchema)
  .action(async ({ parsedInput: { handle }, ctx: { ip } }) => {
    try {
      // 1. Check if the user exists in Redis
      const existingGeneration = await redis.get(`ttv_x:${handle}`);

      if (!existingGeneration) {
        notFound();
      }

      try {
        // 2. Parse and validate the stored data
        const parsedData = JSON.parse(existingGeneration as string);
        console.log(parsedData);
        return { user: parsedData };
      } catch (parseError) {
        console.error("[TTV-X] JSON Parse Error:", parseError);
        console.error("[TTV-X] Attempted to parse:", existingGeneration);
        throw new Error(`Invalid data format in storage: ${parseError}`);
      }
    } catch (error) {
      console.error(`[TTV-X] Error retrieving user ${handle}:`, error);
      // Improve error message
      if (error instanceof Error) {
        throw new Error(`Failed to retrieve user data: ${error.message}`);
      }
      throw new Error("Failed to retrieve user data: Unknown error");
    }
  });
