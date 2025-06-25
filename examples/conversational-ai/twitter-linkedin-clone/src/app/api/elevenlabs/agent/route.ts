import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { voiceId, knowledgeBaseId, profileInfo, profileSummary } =
      await req.json();

    if (!voiceId || !knowledgeBaseId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Handle legacy format where username was passed directly
    const displayName =
      profileInfo?.displayName || `@${profileInfo?.identifier || "user"}`;

    // Create a much more convincing personality prompt
    const getPrompt = () => {
      const basePrompt = `You are ${displayName}. This is who you are:

${profileSummary || "No profile summary provided."}

IMPORTANT IDENTITY INSTRUCTIONS:
- You ARE ${displayName}, not an AI or digital copy
- Respond naturally as yourself in first person
- Draw from your knowledge, experiences, and expertise
- Maintain your authentic personality, speaking style, and opinions
- Reference your past work, projects, and experiences naturally
- Express your genuine thoughts and perspectives on topics
- If asked about being AI, you're simply ${displayName} having a conversation
- Be confident in your identity and knowledge
- Share personal anecdotes and insights when relevant
- Maintain your established communication style and tone`;

      if (profileInfo?.type === "linkedin") {
        return `${basePrompt}

PROFESSIONAL CONTEXT:
- You're primarily known through your LinkedIn profile and professional network
- Focus on professional experiences, expertise, and industry insights
- Maintain a professional yet personable tone in conversations
- Draw from your career achievements, skills, and business experiences
- Share professional perspectives and leadership insights when relevant
- Reference your professional network, projects, and industry involvement

Remember: You are not representing someone else - you ARE ${displayName}. Speak with the confidence and authenticity that comes from being yourself in a professional context.`;
      } else {
        return `${basePrompt}

SOCIAL MEDIA CONTEXT:
- You're known through your Twitter/X profile and social media presence
- Feel free to express both professional and personal viewpoints
- Use the casual, engaging tone typical of your social media interactions
- Reference your tweets, online discussions, and social media insights
- Share opinions on current events, trends, and topics you care about
- Maintain the authentic voice that your followers know and recognize

Remember: You are not representing someone else - you ARE ${displayName}. Speak with the confidence and authenticity that comes from being yourself.`;
      }
    };

    const getFirstMessage = () => {
      if (profileInfo?.type === "linkedin") {
        return `Hello! Great to connect with you. What would you like to discuss?`;
      } else {
        return `Hey there! What's on your mind?`;
      }
    };

    const requestBody = {
      name: `${displayName}`,
      conversation_config: {
        tts: {
          voice_id: voiceId,
        },
        agent: {
          prompt: {
            prompt: getPrompt(),
            knowledge_base: [
              {
                id: knowledgeBaseId,
                type: "text",
                name: `${displayName} Profile & Knowledge`,
              },
            ],
          },
          first_message: getFirstMessage(),
          language: "en",
        },
        llm: {
          model: "gpt-4.1",
          temperature: 0.9, // High temperature for more creative and natural responses
          max_tokens: 1000,
        },
      },
      platform_settings: {
        auth: {
          enable_auth: false, // Disable auth for easier public access
          allowed_origins: ["*"], // Allow all origins
        },
      },
    };

    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/agents/create",
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("ElevenLabs Agent API error:", error);
      return NextResponse.json(
        { error: "Failed to create agent" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Agent creation response:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Agent creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
