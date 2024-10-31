import { z } from "zod";

export const analysisSchema = z.object({
  humorousDescription: z.string().optional(),
  age: z.string().optional(),
  characteristics: z.array(z.string()).optional(),
  voiceFerocity: z.number().optional(),
  voiceSarcasm: z.number().optional(),
  voiceSassFactor: z.number().optional(),
  textToVoicePrompt: z.string().optional(),
  textToGenerate: z.string().optional(),
});

export const tweetSchema = z.object({
  id: z.string(),
  text: z.string(),
  isRetweet: z.boolean(),
  isQuote: z.boolean(),
  isReply: z.boolean(),
})

export const xProfileSchema = z.object({
  name: z.string(),
  description: z.string(),
  profilePicture: z.string(),
  userName: z.string(),
  followers: z.number(),
  following: z.number(),
  location: z.string(),
  tweets: z.array(tweetSchema),
});

export type XProfile = z.infer<typeof xProfileSchema>

export const humanSpecimenSchema = z.object({
  analysis: analysisSchema,
  user: xProfileSchema,
  timestamp: z.string(),
  videoJobs: z.array(z.string()).optional(),
  voicePreviews: z.array(z.string()).optional(),
})

export type HumanSpecimen = z.infer<typeof humanSpecimenSchema>