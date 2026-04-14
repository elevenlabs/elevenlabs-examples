import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";
import { ClientEvent } from "@elevenlabs/elevenlabs-js/api/types/ClientEvent";

function requireApiKey(): string | null {
  const key = process.env.ELEVENLABS_API_KEY;
  return key?.trim() ? key : null;
}

function createClient() {
  return new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });
}

function apiErrorMessage(err: unknown): string {
  if (err instanceof ElevenLabsError) {
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "An unexpected error occurred.";
}

export async function GET(request: Request) {
  const apiKey = requireApiKey();
  if (!apiKey) {
    return Response.json(
      { error: "Missing ELEVENLABS_API_KEY. Add it to your environment." },
      { status: 500 },
    );
  }

  const agentId = new URL(request.url).searchParams.get("agentId")?.trim();
  if (!agentId) {
    return Response.json(
      { error: "Missing agentId. Pass ?agentId=your-agent-id" },
      { status: 400 },
    );
  }

  try {
    const agent = await createClient().conversationalAi.agents.get(agentId);
    return Response.json({
      agentId: agent.agentId,
      agentName: agent.name,
    });
  } catch (err) {
    const status =
      err instanceof ElevenLabsError && err.statusCode ? err.statusCode : 502;
    return Response.json(
      { error: apiErrorMessage(err) },
      { status: status >= 400 && status < 600 ? status : 502 },
    );
  }
}

export async function POST() {
  const apiKey = requireApiKey();
  if (!apiKey) {
    return Response.json(
      { error: "Missing ELEVENLABS_API_KEY. Add it to your environment." },
      { status: 500 },
    );
  }

  try {
    const name = "Quickstart demo assistant";
    const created = await createClient().conversationalAi.agents.create({
      name,
      enableVersioning: true,
      conversationConfig: {
        agent: {
          firstMessage:
            "Hi! I'm your demo assistant. What would you like to talk about?",
          language: "en",
          prompt: {
            prompt:
              "You are a friendly voice assistant for a product demo. Speak naturally, keep replies concise, and behave like a regular spoken voice agent rather than a text-only assistant.",
            llm: "gemini-2.0-flash",
            temperature: 0,
          },
        },
        tts: {
          voiceId: "JBFqnCBsd6RMkjVDRZzb",
          modelId: "eleven_flash_v2",
        },
        conversation: {
          textOnly: false,
          clientEvents: [
            ClientEvent.Audio,
            ClientEvent.Interruption,
            ClientEvent.UserTranscript,
            ClientEvent.TentativeUserTranscript,
            ClientEvent.AgentResponse,
            ClientEvent.InternalTentativeAgentResponse,
            ClientEvent.AgentChatResponsePart,
          ],
        },
      },
      platformSettings: {
        widget: {
          textInputEnabled: false,
          supportsTextOnly: false,
        },
      },
    });

    return Response.json({
      agentId: created.agentId,
      agentName: name,
    });
  } catch (err) {
    const status =
      err instanceof ElevenLabsError && err.statusCode ? err.statusCode : 502;
    return Response.json(
      { error: apiErrorMessage(err) },
      { status: status >= 400 && status < 600 ? status : 502 },
    );
  }
}
