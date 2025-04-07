"use server";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { ElevenLabsClient } from "elevenlabs";
import { Redis } from "@upstash/redis";

// Initialize Redis
const redis = Redis.fromEnv();

const elevenLabsClient = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function uploadFormData(formData: FormData) {
  const knowledgeBase: Array<{
    id: string;
    type: "file" | "url";
    name: string;
  }> = [];
  const files = formData.getAll("file-upload") as File[];
  const email = formData.get("email-input");
  const urls = formData.getAll("url-input");
  const conversationId = formData.get("conversation-id");

  after(async () => {
    // Upload files as background job
    // Create knowledge base entries
    // Loop trhough files and create knowledge base entries
    for (const file of files) {
      if (file.size > 0) {
        const response =
          await elevenLabsClient.conversationalAi.addToKnowledgeBase({ file });
        if (response.id) {
          knowledgeBase.push({
            id: response.id,
            type: "file",
            name: file.name,
          });
        }
      }
    }
    // Append all urls
    for (const url of urls) {
      const response =
        await elevenLabsClient.conversationalAi.addToKnowledgeBase({
          url: url as string,
        });
      if (response.id) {
        knowledgeBase.push({
          id: response.id,
          type: "url",
          name: `url for ${conversationId}`,
        });
      }
    }

    // Store knowledge base IDs and conversation ID in database.
    const redisRes = await redis.set(
      conversationId as string,
      JSON.stringify({ email, knowledgeBase })
    );
    console.log({ redisRes });
  });

  redirect("/success");
}
