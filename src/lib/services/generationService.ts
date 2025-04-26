import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { GenerationCreateResponseDto } from "../../types";
import { AIService } from "./aiService";

export class GenerationService {
  private static instance: GenerationService;
  private aiService: AIService;

  private constructor() {
    this.aiService = AIService.getInstance();
  }

  public static getInstance(): GenerationService {
    if (!GenerationService.instance) {
      GenerationService.instance = new GenerationService();
    }
    return GenerationService.instance;
  }

  async generateFlashcards(
    sourceText: string,
    userId: string,
    textHash: string,
    supabase: SupabaseClient<Database>
  ): Promise<GenerationCreateResponseDto> {
    const startTime = Date.now();

    try {
      console.log("Starting flashcard generation...");
      
      // Generate flashcards first to get the count
      const aiResponse = await this.aiService.generateFlashcards(sourceText);
      const generationDuration = Date.now() - startTime;

      console.log("AI Response received:", {
        generated_count: aiResponse.stats.generated_count,
        duration: generationDuration
      });

      // Create generation record with actual values
      const insertData = {
        user_id: userId,
        source_text_hash: textHash,
        source_text_length: sourceText.length,
        generated_count: aiResponse.stats.generated_count,
        generation_duration: generationDuration,
        accepted_edited_count: 0,
        accepted_unedited_count: 0,
        model: "mock-v1"
      };

      console.log("Attempting to insert generation record:", insertData);

      const { data: generation, error: dbError } = await supabase
        .from("generations")
        .insert(insertData)
        .select()
        .single();

      if (dbError) {
        console.error("Database error details:", {
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint
        });

        // Log error to generation_error_logs
        const { error: logError } = await supabase
          .from("generation_error_logs")
          .insert({
            error_code: `DB_ERROR_${dbError.code || "UNKNOWN"}`,
            error_message: JSON.stringify({
              message: dbError.message,
              details: dbError.details,
              hint: dbError.hint
            }),
            source_text_hash: textHash,
            source_text_length: sourceText.length,
            user_id: userId,
            model: "mock-v1"
          });

        if (logError) {
          console.error("Failed to log error:", logError);
        }

        throw new Error(`Database error: ${dbError.message}`);
      }

      if (!generation) {
        throw new Error("No generation record returned after successful insert");
      }

      console.log("Generation record created successfully:", generation);

      // Return response in the format specified in the API plan
      return {
        generation_id: generation.id,
        flashcards_proposals: aiResponse.flashcards_proposals,
        stats: {
          generated_count: aiResponse.stats.generated_count,
          source_text_length: sourceText.length,
          generation_duration: generationDuration
        }
      };
    } catch (error) {
      console.error("Unexpected error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred");
    }
  }
} 