import { NextRequest, NextResponse } from "next/server";

// NOTE: This endpoint uses Perplexity's Deep Research model which is more comprehensive
// but also more expensive and slower. Currently not in use - we're using regular Sonar Pro
// for better performance and cost efficiency. Available for future use if needed.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, reasoning_effort = "medium", stream = false } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    console.log("Using Deep Research model for comprehensive analysis...");

    const upstream = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PPLX_API_KEY!}`,
      },
      body: JSON.stringify({
        model: "sonar-deep-research",
        messages,
        stream,
        max_tokens: 20000, // Increased for comprehensive reports
        temperature: 0.3, // Lower temperature for more factual research
        reasoning_effort, // Control computational effort
      }),
    });

    if (!upstream.ok) {
      const error = await upstream.text();
      console.error("Perplexity Deep Research API error:", error);
      return NextResponse.json(
        { error: "Failed to fetch from Perplexity Deep Research API" },
        { status: upstream.status }
      );
    }

    // Plain JSON response
    if (!stream) {
      const data = await upstream.json();

      // Log usage for debugging (Deep Research can be expensive)
      if (data.usage) {
        console.log("Deep Research Usage:", {
          prompt_tokens: data.usage.prompt_tokens,
          completion_tokens: data.usage.completion_tokens,
          citation_tokens: data.usage.citation_tokens,
          num_search_queries: data.usage.num_search_queries,
          reasoning_tokens: data.usage.reasoning_tokens,
          total_cost_estimate: calculateCost(data.usage),
        });
      }

      return NextResponse.json(data);
    }

    // Pass through Server-Sent Events stream
    return new NextResponse(upstream.body, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Deep Research API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to calculate estimated cost
function calculateCost(usage: {
  prompt_tokens: number;
  completion_tokens: number;
  citation_tokens: number;
  num_search_queries: number;
  reasoning_tokens: number;
}): string {
  const inputCost = (usage.prompt_tokens / 1000000) * 2; // $2/M input tokens
  const outputCost = (usage.completion_tokens / 1000000) * 8; // $8/M output tokens
  const citationCost = (usage.citation_tokens / 1000000) * 2; // $2/M citation tokens
  const searchCost = (usage.num_search_queries / 1000) * 5; // $5/1000 searches
  const reasoningCost = (usage.reasoning_tokens / 1000000) * 3; // $3/M reasoning tokens

  const totalCost =
    inputCost + outputCost + citationCost + searchCost + reasoningCost;
  return `$${totalCost.toFixed(4)}`;
}
