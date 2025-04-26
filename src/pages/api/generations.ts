import type { APIRoute } from "astro";
import { generateFlashcardsSchema } from "../../lib/schemas/generationSchemas";
import { withRateLimit } from "../../middleware/rateLimit";
import { GenerationService } from "../../lib/services/generationService";
import crypto from "crypto";

export const prerender = false;

// Default user ID for development
const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

// POST /api/generations - Generate flashcards from text
export const POST: APIRoute = withRateLimit(async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { source_text } = generateFlashcardsSchema.parse(body);
    
    // Calculate text hash for duplicate detection
    const textHash = crypto
      .createHash("sha256")
      .update(source_text)
      .digest("hex");

    // Generate flashcards using the generation service
    const generationService = GenerationService.getInstance();
    const result = await generationService.generateFlashcards(
      source_text,
      DEFAULT_USER_ID,
      textHash,
      locals.supabase
    );

    return new Response(
      JSON.stringify(result),
      {
        status: 201,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}); 