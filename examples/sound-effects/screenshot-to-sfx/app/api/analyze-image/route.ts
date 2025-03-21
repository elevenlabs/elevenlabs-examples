import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert the file to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // Get the Google AI API key from environment variables
    const apiKey = process.env.GOOGLE_GEMINI_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google AI API key not configured" },
        { status: 500 }
      );
    }

    // Call the Gemini API to analyze the image
    // Updated to use gemini-1.5-flash model as recommended
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Analyze this image and create a one sentence prompt for generating a sound effect that matches what's in the image. Focus on the mood, objects, actions, and environment visible in the image. The prompt should be specific and descriptive, suitable for an audio generation system.",
                },
                {
                  inline_data: {
                    mime_type: image.type,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generation_config: {
            temperature: 0.4,
            top_k: 32,
            top_p: 1,
            max_output_tokens: 256,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Failed to analyze image" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract the prompt from the Gemini response
    let prompt = "Create a generic sound effect.";

    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text
    ) {
      prompt = data.candidates[0].content.parts[0].text;
    }

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("Error analyzing image:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
