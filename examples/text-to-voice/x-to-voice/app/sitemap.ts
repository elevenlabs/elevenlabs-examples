import { MetadataRoute } from "next";

export const maxDuration = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: "https://www.xtovoice.elevenlabs.io",
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
