import { z } from "zod";

export const TopicSchema = z.object({
  theme: z.string().min(1).max(40),
  majorityWord: z.string().min(1).max(20),
  minorityWord: z.string().min(1).max(20),
});

export const InterjectionSchema = z.object({
  utterance: z.string().min(1).max(160),
});

export const VerdictSchema = z.object({
  narration: z.string().min(1).max(400),
});

export const GmSchema = z.object({
  message: z.string().min(1).max(200),
});

export type TopicResponse = z.infer<typeof TopicSchema>;
export type InterjectionResponse = z.infer<typeof InterjectionSchema>;
export type VerdictResponse = z.infer<typeof VerdictSchema>;
export type GmResponse = z.infer<typeof GmSchema>;
