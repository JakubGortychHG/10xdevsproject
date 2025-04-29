import type { SupabaseClient } from "@supabase/supabase-js";
import type { FlashcardCreateDto, FlashcardDto } from "../../types";
import { DatabaseError, NoDataError } from "./errors";
import { LoggerService } from "./loggerService";

export class FlashcardService {
  private readonly logger = LoggerService.getInstance();

  constructor(private readonly supabase: SupabaseClient) {}

  async createFlashcard(
    payload: FlashcardCreateDto,
    userId: string,
  ): Promise<FlashcardDto> {
    this.logger.info("Creating new flashcard", { userId, source: payload.source });

    const { data, error } = await this.supabase
      .from("flashcards")
      .insert([{ ...payload, user_id: userId }])
      .select()
      .single();

    if (error) {
      this.logger.error("Failed to create flashcard", {
        error,
        userId,
        payload,
      });
      throw new DatabaseError("Failed to create flashcard", error);
    }

    if (!data) {
      this.logger.error("No data returned after creating flashcard", {
        userId,
        payload,
      });
      throw new NoDataError();
    }

    this.logger.info("Successfully created flashcard", {
      flashcardId: data.id,
      userId,
    });

    return {
      id: data.id,
      front: data.front,
      back: data.back,
      source: data.source,
      generation_id: data.generation_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
} 