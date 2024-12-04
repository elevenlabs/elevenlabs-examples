"use server";

import { actionClient } from "@/app/(main)/(santa)/actions/safe-action";
import { z } from "zod";
import { ElevenLabsClient } from "elevenlabs";
import { createClient } from "@supabase/supabase-js";

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
      const { signed_url: signedUrl } = await elevenlabs.conversationalAi
        .getSignedUrl({
          agent_id: agentId,
        })
        .catch(err => {
          console.error("Error getting signed URL:", err.message);
          throw new Error("Failed to get signed URL");
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

export const getAgentConversationAudio = actionClient
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

    const options = {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
        Accept: "application/json",
      },
    };

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`,
        options
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || `HTTP error! status: ${response.status}`
        );
      }

      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString("base64");

      return { audio: base64Audio };
    } catch (error) {
      console.error("Error fetching conversation audio:", error);
      throw new Error(
        error instanceof Error
          ? `Failed to get conversation audio: ${error.message}`
          : "Failed to get conversation audio"
      );
    }
  });

const BUCKET_NAME = "media";

export const getSupabaseUploadSignedUrl = actionClient
  .schema(z.object({ conversationId: z.string() }))
  .action(async ({ parsedInput: { conversationId } }) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Environment variables are not set");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const filePath = `${BUCKET_NAME}/${conversationId}.mp4`;

    // Generate the signed upload URL
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(filePath);

    if (error) {
      throw new Error(`Failed to create signed upload URL: ${error.message}`);
    }

    return data;
  });

export const saveConversationData = actionClient
  .schema(
    z.object({
      conversationId: z.string(),
      name: z.string().nullable(),
      wishlist: z.array(z.object({ key: z.string(), name: z.string() })),
    })
  )
  .action(async ({ parsedInput: { conversationId, name, wishlist } }) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Environment variables are not set");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase.from("conversations").insert({
      id: conversationId,
      name,
      wishlist,
    });

    if (error) {
      throw new Error(`Failed to save conversation data: ${error.message}`);
    }

    return { success: true };
  });

export const getConversationData = actionClient
  .schema(
    z.object({
      conversationId: z.string(),
    })
  )
  .action(async ({ parsedInput: { conversationId } }) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Environment variables are not set");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (error) {
        throw new Error(`Failed to get conversation data: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Failed to get conversation data: ${error.message}`
          : "Failed to get conversation data"
      );
    }
  });
