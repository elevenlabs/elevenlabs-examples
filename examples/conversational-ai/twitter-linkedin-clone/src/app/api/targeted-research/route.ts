import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { topics, profileInfo } = await req.json();

    if (!topics || !Array.isArray(topics)) {
      return NextResponse.json(
        { error: "Topics array is required" },
        { status: 400 }
      );
    }

    // Handle legacy format where username was passed directly
    const displayName =
      profileInfo?.displayName || `@${profileInfo?.identifier || "user"}`;
    const platform =
      profileInfo?.type === "linkedin" ? "LinkedIn" : "Twitter/X";
    const profileUrl = profileInfo?.url || "";

    console.log(
      `Conducting targeted research on ${topics.length} topics for ${displayName} from ${platform}`
    );

    // Conduct research on each topic in parallel
    const researchPromises = topics.map(
      async (topic: {
        title: string;
        reason?: string;
        searchQuery?: string;
      }) => {
        const getSearchPrompt = () => {
          if (profileInfo?.type === "linkedin") {
            return `Provide detailed professional information about ${displayName} and ${
              topic.searchQuery || topic.title
            }. Profile URL: ${profileUrl}
        
Focus on professional aspects:
- Specific career details, achievements, or professional outcomes
- Timeline and career progression context
- Key professional accomplishments or milestones
- Technical expertise, certifications, or specialized skills
- Professional challenges, leadership experiences, or business impact
- Recent career moves, projects, or professional developments
- Industry recognition, awards, or professional accolades
- Speaking engagements, publications, or thought leadership

Be extremely specific and factual about professional information. This will be used to answer detailed questions about their career and expertise.`;
          } else {
            return `Provide detailed information about ${displayName} and ${
              topic.searchQuery || topic.title
            }. Profile URL: ${profileUrl}
        
Focus on:
- Specific details, quotes, or examples from their posts/content
- Timeline and context of their statements or activities
- Key achievements, projects, or outcomes they've discussed
- Technical details, opinions, or expertise they've shared
- Any controversies, debates, or challenges they've addressed
- Recent updates, announcements, or developments they've mentioned
- Interactions with other notable figures or responses to trends
- Personal insights, experiences, or perspectives they've shared

Be extremely specific and factual. This information will be used to answer detailed questions about this topic.`;
          }
        };

        const response = await fetch(
          "https://api.perplexity.ai/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.PPLX_API_KEY!}`,
            },
            body: JSON.stringify({
              model: "sonar-pro",
              messages: [
                {
                  role: "system",
                  content: `You are a research assistant gathering detailed, factual information about ${platform} profiles. Focus on specific details and concrete examples.`,
                },
                {
                  role: "user",
                  content: getSearchPrompt(),
                },
              ],
              max_tokens: 2000,
              temperature: 0.3,
            }),
          }
        );

        if (!response.ok) {
          console.error(`Failed to research topic: ${topic.title}`);
          return {
            topic: topic.title,
            research: `Failed to gather research on this topic.`,
            error: true,
          };
        }

        const data = await response.json();
        const research = data.choices?.[0]?.message?.content || "";

        return {
          topic: topic.title,
          reason: topic.reason,
          research: research,
        };
      }
    );

    // Wait for all research to complete
    const researchResults = await Promise.all(researchPromises);

    // Compile all research into a structured format
    const compiledResearch = researchResults
      .map((result) => {
        return `
### TOPIC: ${result.topic}
**Why this matters:** ${result.reason || "Key conversation topic"}

${result.research}

---
`;
      })
      .join("\n");

    return NextResponse.json({
      targetedResearch: compiledResearch,
      topics: researchResults,
    });
  } catch (error) {
    console.error("Targeted research error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
