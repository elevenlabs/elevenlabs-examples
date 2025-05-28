import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email/post-call-webhook-email";

// Initialize Redis
const redis = Redis.fromEnv();
// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const elevenLabsClient = new ElevenLabsClient();

export async function GET() {
  return NextResponse.json({ status: "webhook listening" }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const secret = process.env.ELEVENLABS_CONVAI_WEBHOOK_SECRET;
  let event;

  try {
    event = await elevenLabsClient.webhooks.constructEvent(req.text(), req.headers.get("ElevenLabs-Signature"), secret);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 401 });
  }

  if (event.type === "post_call_transcription") {
    const { conversation_id, analysis, agent_id } = event.data;

    if (
      agent_id === process.env.ELEVENLABS_AGENT_ID &&
      analysis.evaluation_criteria_results.all_data_provided?.result ===
        "success" &&
      analysis.data_collection_results.voice_description?.value
    ) {
      try {
        // Design the voice
        const voicePreview = await elevenLabsClient.textToVoice.createPreviews({
          voiceDescription:
            analysis.data_collection_results.voice_description.value,
          text: "The night air carried whispers of betrayal, thick as London fog. I adjusted my cufflinks - after all, even spies must maintain appearances, especially when the game is afoot.",
        });
        const voice = await elevenLabsClient.textToVoice.createVoiceFromPreview(
          {
            voiceName: `voice-${conversation_id}`,
            voiceDescription: `Voice for ${conversation_id}`,
            generatedVoiceId: voicePreview.previews[0].generatedVoiceId,
          }
        );

        // Get the knowledge base from redis
        const redisRes = await getRedisDataWithRetry(conversation_id);
        if (!redisRes) throw new Error("Conversation data not found!");
        // Handle agent creation
        const agent = await elevenLabsClient.conversationalAi.agents.create({
          name: `Agent for ${conversation_id}`,
          conversationConfig: {
            tts: { voiceId: voice.voiceId },
            agent: {
              prompt: {
                prompt:
                  analysis.data_collection_results.agent_description?.value ??
                  "You are a helpful assistant.",
                knowledgeBase: redisRes.knowledgeBase,
              },
              firstMessage: "Hello, how can I help you today?",
            },
          },
        });
        console.log("Agent created", { agent: agent.agentId });
        // Send email to user
        console.log("Sending email to", redisRes.email);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: redisRes.email,
          subject: "Your Conversational AI agent is ready to chat!",
          react: EmailTemplate({ agentId: agent.agentId }),
        });
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function getRedisDataWithRetry(
  conversationId: string,
  maxRetries = 5
): Promise<{
  email: string;
  knowledgeBase: Array<{
    id: string;
    type: "file" | "url";
    name: string;
  }>;
} | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const data = await redis.get(conversationId);
      return data as any;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.log(`Redis get attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
}
