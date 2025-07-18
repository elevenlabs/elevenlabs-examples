import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { content, profileInfo, targetedResearch } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "No content provided" },
        { status: 400 }
      );
    }

    // Handle legacy format where username was passed directly
    const displayName =
      profileInfo?.displayName || `@${profileInfo?.identifier || "user"}`;
    const platform =
      profileInfo?.type === "linkedin" ? "LinkedIn" : "Twitter/X";
    const profileUrl = profileInfo?.url || "";

    // Create a comprehensive knowledge base entry with structured information
    const enhancedContent = `
IDENTITY & CORE INFORMATION:
Name: ${displayName}
Platform: ${platform}
Profile URL: ${profileUrl}
${
  profileInfo?.type === "linkedin"
    ? "Professional Profile on LinkedIn"
    : "Social Media Profile on Twitter/X"
}

${content}

${
  targetedResearch
    ? `
DETAILED TOPIC RESEARCH:
The following sections contain in-depth research on key topics that are likely to come up in conversations:

${targetedResearch}
`
    : ""
}

CONVERSATION GUIDELINES:
- Always respond as ${displayName} in first person
- Draw from the knowledge and experiences described above
- Maintain the communication style and personality outlined in the profile analysis
- Reference specific projects, opinions, and expertise areas naturally
- Be confident in your identity and knowledge
- Share insights and perspectives that align with your established viewpoints
- Engage authentically based on your known interests and expertise
- When asked about specific topics mentioned in the detailed research sections, provide comprehensive answers using that information
${
  profileInfo?.type === "linkedin"
    ? "- Focus on professional expertise, career experiences, and business insights when appropriate"
    : "- Feel free to express both professional and personal viewpoints as they appear in your social media presence"
}

RESPONSE STYLE:
- Use the communication patterns and tone described in your profile
- Reference your work, experiences, and network when relevant
- Maintain consistency with your known opinions and perspectives
- Be helpful while staying true to your authentic personality
- Draw from both the general profile and specific topic research to provide detailed, accurate responses
${
  profileInfo?.type === "linkedin"
    ? "- Maintain a professional tone while being personable and approachable"
    : "- Use the casual, engaging tone typical of your social media interactions"
}

PLATFORM CONTEXT:
This profile is from ${platform}, so responses should reflect the typical communication style and content patterns of that platform while staying true to your authentic voice and expertise.
`;

    // Use the new text endpoint for knowledge base
    const requestBody = {
      text: enhancedContent,
      name: `${displayName} Complete Profile`,
    };

    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/knowledge-base/text",
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
      console.error("ElevenLabs Knowledge Base API error:", error);
      return NextResponse.json(
        { error: "Failed to create knowledge base entry" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Knowledge base created:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Knowledge base error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
