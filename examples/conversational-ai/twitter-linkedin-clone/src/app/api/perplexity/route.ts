import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, stream = false } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const upstream = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PPLX_API_KEY!}`,
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages,
        stream,
        max_tokens: 10000,
        temperature: 0.7,
      }),
    });

    if (!upstream.ok) {
      const error = await upstream.text();
      console.error("Perplexity API error:", error);
      return NextResponse.json(
        { error: "Failed to fetch from Perplexity API" },
        { status: upstream.status }
      );
    }

    // Plain JSON response
    if (!stream) {
      const data = await upstream.json();
      return NextResponse.json(data);
    }

    // Pass through Server-Sent Events stream
    return new NextResponse(upstream.body, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
