import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { GenerationCreateResponseDto } from "../../types";
import { OpenRouterService, OpenRouterAuthError } from "./openRouterService";
import type { Message } from "./openRouterService";

export class GenerationService {
  private static instance: GenerationService;
  private openRouter: OpenRouterService;

  private constructor() {
    // Initialize OpenRouter with API key from environment
    const apiKey = import.meta.env.PRIVATE_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new OpenRouterAuthError("OPENROUTER_API_KEY environment variable is not set");
    }

    this.openRouter = new OpenRouterService({
      apiKey,
      defaultModel: "openai/gpt-4o-mini", // Using GPT-4 Mini for best quality
      defaultParams: {
        temperature: 0.7,
        max_tokens: 2000, // Increased for flashcard generation
        top_p: 1,
        frequency_penalty: 0.3, // Slight increase to encourage diverse responses
        presence_penalty: 0.3, // Slight increase to discourage repetition
      },
    });
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
    supabase: SupabaseClient<Database>,
  ): Promise<GenerationCreateResponseDto> {
    const startTime = Date.now();

    try {
      console.log("Starting flashcard generation...");

      // System message defining the task and format
      const systemMessage: Message = {
        role: "system",
        content: `You are a flashcard generation assistant. Create flashcards from the provided text.
Each flashcard should have a front (question/prompt) and back (answer/explanation).
Format your response as a JSON array of flashcard objects with the following structure:
{
  "flashcards_proposals": [
    {
      "front": "question or prompt",
      "back": "answer or explanation",
      "confidence": number between 0 and 1,
      "metadata": {
        "source_text_start": index where the source text for this card begins,
        "source_text_end": index where the source text for this card ends,
        "type": "definition" | "concept" | "fact" | "process" | "relationship"
      }
    }
  ]
}
Guidelines:
- Create clear, concise, and focused flashcards
- Ensure questions test understanding, not just memorization
- Include relevant context in answers
- Assign appropriate confidence scores based on clarity and importance
- Mark text positions accurately for traceability
- Categorize each flashcard with the appropriate type`,
      };

      // User message with the source text
      const userMessage: Message = {
        role: "user",
        content: sourceText,
      };

      // Generate flashcards using OpenRouter
      const response = await this.openRouter.chat({
        messages: [systemMessage, userMessage],
        responseFormat: {
          type: "json_schema",
          json_schema: {
            name: "flashcards_response",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                flashcards_proposals: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      front: { type: "string" },
                      back: { type: "string" },
                      confidence: { type: "number" },
                      metadata: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                          source_text_start: { type: "number" },
                          source_text_end: { type: "number" },
                          type: { 
                            type: "string",
                            enum: ["definition", "concept", "fact", "process", "relationship"]
                          }
                        },
                        required: ["source_text_start", "source_text_end", "type"]
                      }
                    },
                    required: ["front", "back", "confidence", "metadata"]
                  }
                }
              },
              required: ["flashcards_proposals"]
            }
          }
        }
      });

      const generationDuration = Date.now() - startTime;
      const aiResponse = JSON.parse(response.choices[0].message.content as string);

      console.log("AI Response received:", {
        generated_count: aiResponse.flashcards_proposals.length,
        duration: generationDuration,
      });

      // Create generation record
      const insertData = {
        user_id: userId,
        source_text_hash: textHash,
        source_text_length: sourceText.length,
        generated_count: aiResponse.flashcards_proposals.length,
        generation_duration: generationDuration,
        accepted_edited_count: 0,
        accepted_unedited_count: 0,
        model: response.model,
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
          hint: dbError.hint,
        });

        // Log error to generation_error_logs
        const { error: logError } = await supabase
          .from("generation_error_logs")
          .insert({
            error_code: `DB_ERROR_${dbError.code || "UNKNOWN"}`,
            error_message: JSON.stringify({
              message: dbError.message,
              details: dbError.details,
              hint: dbError.hint,
            }),
            source_text_hash: textHash,
            source_text_length: sourceText.length,
            user_id: userId,
            model: response.model,
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

      return {
        generation_id: generation.id,
        flashcards_proposals: aiResponse.flashcards_proposals,
        stats: {
          generated_count: aiResponse.flashcards_proposals.length,
          source_text_length: sourceText.length,
          generation_duration: generationDuration,
        },
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