import { z } from "zod";

// Schema for the request body of POST /generations endpoint
export const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text must not exceed 10000 characters")
    .trim(),
});

// Schema for validating AI response format
export const flashcardProposalSchema = z.object({
  front: z.string().max(200, "Front text must not exceed 200 characters"),
  back: z.string().max(500, "Back text must not exceed 500 characters"),
  source: z.literal("ai-full"),
});

export const aiResponseSchema = z.object({
  flashcards_proposals: z.array(flashcardProposalSchema),
  stats: z.object({
    generated_count: z.number(),
    source_text_length: z.number(),
    generation_duration: z.number(),
  }),
});

// Types inferred from schemas
export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;
export type FlashcardProposal = z.infer<typeof flashcardProposalSchema>;
export type AIResponse = z.infer<typeof aiResponseSchema>; 