import type { FlashcardProposal } from "../schemas/generationSchemas";

interface AIServiceResponse {
  flashcards_proposals: FlashcardProposal[];
  stats: {
    generated_count: number;
    source_text_length: number;
    generation_duration: number;
  };
}

// Mock implementation of the AI service
export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateFlashcards(sourceText: string): Promise<AIServiceResponse> {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock response with sample flashcards
    const mockFlashcards: FlashcardProposal[] = [
      {
        front: "What is the capital of France?",
        back: "Paris is the capital of France",
        source: "ai-full",
      },
      {
        front: "Who wrote 'Romeo and Juliet'?",
        back: "William Shakespeare wrote 'Romeo and Juliet'",
        source: "ai-full",
      },
    ];

    return {
      flashcards_proposals: mockFlashcards,
      stats: {
        generated_count: mockFlashcards.length,
        source_text_length: sourceText.length,
        generation_duration: 1000, // milliseconds
      },
    };
  }
}
