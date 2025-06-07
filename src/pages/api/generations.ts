import type { APIRoute } from "astro";
import { generateFlashcardsSchema } from "../../lib/schemas/generationSchemas";
import { GenerationService } from "../../lib/services/generationService";
import { LoggerService } from "../../lib/services/loggerService";
import crypto from "crypto";

export const prerender = false;

const logger = LoggerService.getInstance();

// POST /api/generations - Generate flashcards from text
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get authenticated user from locals (set by middleware)
    // This endpoint supports both authenticated and anonymous users
    const user = locals.user;

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
      isAnonymous: !user,
    });

    // Generate flashcards using the generation service
    const generationService = GenerationService.getInstance();

    if (!user) {
      // For anonymous users, generate flashcards without saving to database
      const aiResponse =
        await generationService.generateAnonymousFlashcards(source_text);

      logger.info("Anonymous flashcard generation completed", {
        flashcardsCount: aiResponse.flashcards_proposals.length,
        isAnonymous: true,
      });

      return new Response(
        JSON.stringify({
          flashcards_proposals: aiResponse.flashcards_proposals,
          stats: {
            generated_count: aiResponse.flashcards_proposals.length,
            source_text_length: source_text.length,
          },
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // For authenticated users, generate and save to database
    const generationResult = await generationService.generateFlashcards(
      source_text,
      user.id,
      textHash,
      locals.supabase,
    );

    logger.info("Authenticated flashcard generation completed", {
      generationId: generationResult.generation_id,
      flashcardsCount: generationResult.stats.generated_count,
      duration: generationResult.stats.generation_duration,
      userId: user.id,
    });

    return new Response(JSON.stringify(generationResult), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
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

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
