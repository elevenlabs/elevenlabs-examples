"use server";
import { redirect } from "next/navigation";
import { ElevenLabsClient } from "elevenlabs";
import { Redis } from "@upstash/redis";

// Initialize Redis
const redis = Redis.fromEnv();

const elevenLabsClient = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function uploadFormData(formData: FormData) {
  const knowledgeBaseIds: string[] = [];
  const files = formData.getAll("file-upload") as File[];
  const text = formData.get("text-input");
  const email = formData.get("email-input");
  const urls = formData.getAll("url-input");
  const conversationId = formData.get("conversation-id");

  console.log({ files, text, email, urls, conversationId });

  // Create knowledge base entries
  // Loop trhough files and create knowledge base entries
  for (const file of files) {
    const response = await elevenLabsClient.conversationalAi.addToKnowledgeBase(
      { file }
    );
    if (response.id) {
      knowledgeBaseIds.push(response.id);
    }
  }
  // Append all urls
  for (const url of urls) {
    const response = await elevenLabsClient.conversationalAi.addToKnowledgeBase(
      { url: url as string }
    );
    if (response.id) {
      knowledgeBaseIds.push(response.id);
    }
  }
  console.log({ knowledgeBaseIds });

  // Store knowledge base IDs and conversation ID in database.
  const redisRes = await redis.set(
    conversationId as string,
    JSON.stringify(knowledgeBaseIds)
  );
  console.log({ redisRes });

  redirect("/success");
}
