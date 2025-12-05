import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { profileSummary, profileInfo } = await req.json();

    if (!profileSummary) {
      return NextResponse.json(
        { error: "Profile summary is required" },
        { status: 400 }
      );
    }

    // Handle legacy format where username was passed directly
    const displayName =
      profileInfo?.displayName || `@${profileInfo?.identifier || "user"}`;
    const platform =
      profileInfo?.type === "linkedin" ? "LinkedIn" : "Twitter/X";

    const prompt = `Based on this comprehensive profile of ${displayName} from ${platform}, identify the TOP 5 most likely conversation topics that someone would ask about or discuss with them. 

These should be specific areas where an interviewer, colleague, or curious person would want to dive deeper. Focus on:
- Their specific projects or achievements mentioned
- Technologies or methodologies they're known for
- Companies or organizations they've worked with
- Controversial opinions or unique perspectives they hold
- Recent announcements or initiatives

${
  profileInfo?.type === "linkedin"
    ? "Professional context: This is a LinkedIn profile, so focus on professional achievements, career progression, industry expertise, and business insights."
    : "Social media context: This is a Twitter/X profile, so consider both professional and personal topics, opinions, and social commentary."
}

For each topic, provide:
1. A specific, searchable topic title
2. Why this topic would likely come up in conversation
3. What specific information would be valuable to know

Profile Summary:
${profileSummary}

Format your response as a JSON array with exactly 5 topics, each containing 'title', 'reason', and 'searchQuery' fields.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content:
              "You are an expert at analyzing profiles and identifying key conversation topics. Always respond with valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3, // Low temperature for consistent analysis
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return NextResponse.json(
        { error: "Failed to analyze topics" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      const parsed = JSON.parse(content);
      // Ensure we have a topics array
      const topics = Array.isArray(parsed) ? parsed : parsed.topics || [];

      // Validate each topic has required fields
      const validatedTopics = topics.map(
        (
          topic: { title?: string; reason?: string; searchQuery?: string },
          index: number
        ) => ({
          title: topic.title || `Topic ${index + 1}`,
          reason: topic.reason || "Important conversation topic",
          searchQuery: topic.searchQuery || topic.title || `Topic ${index + 1}`,
        })
      );

      return NextResponse.json({ topics: validatedTopics });
    } catch (error) {
      console.error("Failed to parse OpenAI response:", content, error);
      return NextResponse.json(
        { error: "Failed to parse topic analysis" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Topic analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
