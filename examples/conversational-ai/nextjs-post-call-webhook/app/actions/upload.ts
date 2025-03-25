"use server";
import { redirect } from "next/navigation";

const createKnowledgeBaseEntry = async (form: FormData) => {
  const url = "https://api.elevenlabs.io/v1/convai/knowledge-base";

  const options: { [key: string]: any } = {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY },
  };
  options.body = form;

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export async function uploadFormData(formData: FormData) {
  const knowledgeBaseIds: string[] = [];
  const files = formData.getAll("file-upload") as File[];
  const text = formData.get("text-input");
  const email = formData.get("email-input");
  const urls = formData.getAll("url-input");
  const conversationId = formData.get("conversation-id");

  console.log({ files, text, email, urls, conversationId });

  // Create knowledge base entries
  // Loop trhough files and create knowledge base entries
  for (const file of files) {
    const form = new FormData();
    form.append("file", file);
    const response = await createKnowledgeBaseEntry(form);
    if (response.data) {
      knowledgeBaseIds.push(response.data.id);
    }
  }
  // Append all urls
  for (const url of urls) {
    const form = new FormData();
    form.append("url", url);
    const response = await createKnowledgeBaseEntry(form);
    if (response.data) {
      knowledgeBaseIds.push(response.data.id);
    }
  }

  // Store knowledge base IDs and conversation ID in database.

  redirect("/success");
}
