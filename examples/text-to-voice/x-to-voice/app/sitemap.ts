import { MetadataRoute } from "next";
import { Redis } from "@upstash/redis";
import { env } from "@/env.mjs";

const kv = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const keyHandles: string[] = [];
  let cursor = "0";
  const keyMatcher = "ttv_x:"
  try {
    do {
      const result = await kv.scan(cursor, {
        match: `${keyMatcher}*`, count: 100,
      });
      cursor = result[0];
      keyHandles.push(...result[1]);
    } while (cursor !== "0");
  } catch (error) {
    console.error("Could not fetch keyHandles:", error);
  }

  const sites: MetadataRoute.Sitemap = keyHandles.map((keyHandle: string) => (
    {
      url: `https://www.xtovoice.com/${keyHandle.slice(keyMatcher.length)}`,
      changeFrequency: "weekly",
      priority: 1,
    }
  ));

  return [
    {
      url: "https://www.xtovoice.com/",
      changeFrequency: "weekly",
      priority: 1,
    },
    ...sites,
  ];
}