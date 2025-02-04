const scribeFile = async (
  { file }: { file: File | Blob },
) => {
  // Create a FormData object which is what ElevenLabs expects
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model_id", "scribe_v1");
  // formData.append("language_code", "fr");

  // Manual fetch request to ElevenLabs API to see the exact error
  const response = await fetch("https://api.eleven2.dev/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": Deno.env.get("ELEVENLABS_API_KEY") || "",
    },
    body: formData,
  });

  const responseData = await response.json();
  console.log("ElevenLabs response:", responseData);

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${JSON.stringify(responseData)}`);
  }

  return responseData;
};

export { scribeFile };
