import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    VERCEL_URL: z
      .string()
      .optional()
      .transform(v => (v ? `https://${v}` : undefined)),
    PORT: z.coerce.number().default(3000),
  },
  server: {
    APIFY_API_KEY: z.string(),
    ELEVENLABS_API_KEY: z.string(),
    OPEN_AI_API_KEY: z.string(),
    KV_URL: z.string(),
    KV_REST_API_READ_ONLY_TOKEN: z.string(),
    KV_REST_API_TOKEN: z.string(),
    KV_REST_API_URL: z.string(),
  },
  client: {},
  runtimeEnv: {
    APIFY_API_KEY: process.env.APIFY_API_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
    KV_URL: process.env.KV_URL,
    KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
