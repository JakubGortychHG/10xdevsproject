import { z } from "zod";

// Define the source enum values
const FlashcardSource = z.enum(["manual", "ai-full", "ai-edited"]);
type FlashcardSource = z.infer<typeof FlashcardSource>;

// Helper function to sanitize text content
const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags and their content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "") // Remove style tags and their content
    .replace(/<[^>]+>[^<]*<\/[^>]+>/g, "") // Remove other tags and their content
    .replace(/<[^>]*>?/gm, "") // Remove any remaining tags
    .replace(/&[^;]+;/g, "") // Remove HTML entities
    .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, ""); // Remove non-printable characters
};

// Schema for creating a single flashcard
export const flashcardCreateSchema = z
  .object({
    front: z
      .string()
      .min(1, "Front content is required")
      .max(200, "Front content must not exceed 200 characters")
      .transform(sanitizeText),
    back: z
      .string()
      .min(1, "Back content is required")
      .max(500, "Back content must not exceed 500 characters")
      .transform(sanitizeText),
    source: FlashcardSource,
    generation_id: z.number().nullable(),
  })
  .refine(
    (data) => {
      // Validate generation_id based on source
      if (data.source === "manual" && data.generation_id !== null) {
        return false;
      }
      if (
        (data.source === "ai-full" || data.source === "ai-edited") &&
        data.generation_id === null
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "generation_id must be null for manual source and required for ai-full or ai-edited sources",
      path: ["generation_id"],
    },
  );

// Schema for batch creating multiple flashcards
export const flashcardsCreateCommandSchema = z.object({
  flashcards: z
    .array(flashcardCreateSchema)
    .min(1, "At least one flashcard is required")
    .max(100, "Maximum 100 flashcards allowed per request"),
});
