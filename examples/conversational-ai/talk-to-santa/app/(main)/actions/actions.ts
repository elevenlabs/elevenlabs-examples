"use server";

import { actionClient } from "@/app/(main)/actions/safe-action";
import { z } from "zod";
import { ElevenLabsClient } from "elevenlabs";

export const getAgentSignedUrl = actionClient
  .schema(z.object({}))
  .action(async () => {
    const agentId = process.env.AGENT_ID;
    const apiKey = process.env.XI_API_KEY;

    if (!agentId || !apiKey) {
      throw new Error("Environment variables are not set");
    }

    const elevenlabs = new ElevenLabsClient({
      apiKey: apiKey,
    });

    try {
      const { signed_url: signedUrl } =
        await elevenlabs.conversationalAi.getSignedUrl({
          agent_id: agentId,
        });

      if (!signedUrl) {
        throw new Error("Failed to get signed URL");
      }

      return { signedUrl };
    } catch (error) {
      throw new Error(`Failed to get signed URL: ${error}`);
    }
  });

export const getAgentConversation = actionClient
  .schema(
    z.object({
      conversationId: z.string(),
    })
  )
  .action(async ({ parsedInput: { conversationId } }) => {
    const apiKey = process.env.XI_API_KEY;

    if (!apiKey) {
      throw new Error("XI_API_KEY is not set");
    }

    const elevenlabs = new ElevenLabsClient({
      apiKey: apiKey,
    });

    try {
      const conversation = await elevenlabs.conversationalAi.getConversation(
        conversationId
      );
      return { conversation };
    } catch (error) {
      throw new Error(`Failed to get conversation: ${error}`);
    }
  });
