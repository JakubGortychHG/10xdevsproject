import type { APIRoute } from "astro";
import { generateFlashcardsSchema } from "../../lib/schemas/generationSchemas";
import { withRateLimit } from "../../middleware/rateLimit";
import { GenerationService } from "../../lib/services/generationService";
import { LoggerService } from "../../lib/services/loggerService";
import crypto from "crypto";

export const prerender = false;

// Default user ID for development
const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

const logger = LoggerService.getInstance();

// POST /api/generations - Generate flashcards from text
export const POST: APIRoute = withRateLimit(async ({ request, locals }) => {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      logger.warn("Failed to parse JSON body", { error: e });
      return new Response(
        JSON.stringify({
          error: "Invalid JSON format",
          details: "The request body must be a valid JSON",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate request body
    const result = generateFlashcardsSchema.safeParse(body);
    if (!result.success) {
      logger.warn("Validation failed for flashcard generation", {
        errors: result.error.format(),
      });
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: result.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { source_text } = result.data;
    
    // Calculate text hash for duplicate detection
    const textHash = crypto
      .createHash("sha256")
      .update(source_text)
      .digest("hex");

    logger.info("Starting flashcard generation", {
      textLength: source_text.length,
      textHash,
    });

    // Generate flashcards using the generation service
    const generationService = GenerationService.getInstance();
    const generationResult = await generationService.generateFlashcards(
      source_text,
      DEFAULT_USER_ID,
      textHash,
      locals.supabase,
    );

    logger.info("Flashcard generation completed", {
      generationId: generationResult.generation_id,
      flashcardsCount: generationResult.stats.generated_count,
      duration: generationResult.stats.generation_duration,
    });

    return new Response(
      JSON.stringify(generationResult),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    logger.error("Error in POST /api/generations", { error });

    if (error instanceof Error) {
      // Check if it's an OpenRouter error
      if (error.name?.includes("OpenRouter")) {
        return new Response(
          JSON.stringify({
            error: "AI Service error",
            details: error.message,
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return new Response(
        JSON.stringify({
          error: "Request failed",
          details: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}); 