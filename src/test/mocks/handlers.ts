import { http, HttpResponse } from "msw";
import type { GenerationCreateResponseDto } from "../../types";

// Define your API mocks here
export const handlers = [
  // Example handler
  http.get("/api/example", () => {
    return HttpResponse.json({
      status: "success",
      data: {
        message: "This is a mocked API response",
      },
    });
  }),

  // Flashcard generation endpoint
  http.post("/api/generations", () => {
    const mockResponse: GenerationCreateResponseDto = {
      generation_id: 123,
      flashcards_proposals: [
        { front: "Question 1", back: "Answer 1", source: "ai-full" },
        { front: "Question 2", back: "Answer 2", source: "ai-full" },
        { front: "Question 3", back: "Answer 3", source: "ai-full" },
      ],
      stats: {
        generated_count: 3,
        source_text_length: 1500,
        generation_duration: 2000,
      },
    };

    return HttpResponse.json(mockResponse);
  }),

  // Flashcard save endpoint
  http.post("/api/flashcards", () => {
    return HttpResponse.json({
      status: "success",
      message: "Flashcards saved successfully",
    });
  }),
];
