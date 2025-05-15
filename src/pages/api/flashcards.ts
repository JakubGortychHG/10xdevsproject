import type { APIRoute } from "astro";
import { FlashcardService } from "../../lib/services/flashcardService";
import { flashcardsCreateCommandSchema } from "../../lib/schemas/flashcardSchemas";
import { withRateLimit } from "../../middleware/rateLimit";
import { DatabaseError, NoDataError } from "../../lib/services/errors";
import { LoggerService } from "../../lib/services/loggerService";
import { AuthService } from "../../lib/services/authService";

export const prerender = false;

const logger = LoggerService.getInstance();

export const POST: APIRoute = withRateLimit(async ({ request, locals, cookies }) => {
  try {
    // Get authenticated user
    const authService = AuthService.getInstance();
    authService.initializeClient({ cookies, headers: request.headers });
    
    const user = await authService.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
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
        }
      );
    }

    const result = flashcardsCreateCommandSchema.safeParse(body);
    if (!result.success) {
      logger.warn("Validation failed for flashcards batch creation", {
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
        }
      );
    }

    // Create flashcards using service
    const flashcardService = new FlashcardService(locals.supabase);
    const response = await flashcardService.createFlashcards(
      result.data.flashcards,
      user.id
    );

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Error in POST /api/flashcards", { error });

    if (error instanceof DatabaseError) {
      return new Response(
        JSON.stringify({ error: "Database error occurred" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (error instanceof NoDataError) {
      return new Response(
        JSON.stringify({ error: "No data returned from database" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}); 