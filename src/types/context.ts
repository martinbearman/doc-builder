import { z } from "zod";

export const contextBucketItemSchema = z.object({
  id: z.string(),
  type: z.enum(["url", "pdf"]),
  urlOrKey: z.string(),
  label: z.string().optional(),
  resolvedText: z.string().optional(),
});
export type ContextBucketItem = z.infer<typeof contextBucketItemSchema>;

export const selectedBlockContextSchema = z.object({
  blockId: z.string(),
  type: z.string(),
  summary: z.string(),
});
export type SelectedBlockContext = z.infer<typeof selectedBlockContextSchema>;

export const highlightPayloadSchema = z.object({
  blockIds: z.array(z.string()),
  suggestions: z.record(z.string(), z.string()).optional(),
});
export type HighlightPayload = z.infer<typeof highlightPayloadSchema>;
