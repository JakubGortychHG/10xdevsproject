import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGenerationView } from "../../lib/hooks/useGenerationView";
import { http, HttpResponse } from "msw";
import { server } from "../../test/mocks/server";
import type { 
  FlashcardProposalViewModel,
  GenerationCreateResponseDto,
} from "../../types";

// Mocking the ErrorDisplay utility
vi.mock("../../components/ErrorDisplay", () => ({
  default: {
    showSuccess: vi.fn(),
    showSaveError: vi.fn(),
    showGenerationError: vi.fn(),
  },
}));

// Mocking crypto.randomUUID
let uuidCounter = 0;
vi.stubGlobal("crypto", {
  randomUUID: () => `test-uuid-${++uuidCounter}`,
});

describe("useGenerationView", () => {
  // Sample test data
  const sampleSourceText = 
    "This is a sample source text that meets the minimum requirement of 1000 characters. ".repeat(
      20,
    );
  
  const sampleGenerationCommand = { source_text: sampleSourceText };
  
  const sampleGenerationResponse: GenerationCreateResponseDto = {
    generation_id: 123,
    flashcards_proposals: [
      { front: "Test Front 1", back: "Test Back 1", source: "ai-full" },
      { front: "Test Front 2", back: "Test Back 2", source: "ai-full" },
    ],
    stats: {
      generated_count: 2,
      source_text_length: sampleSourceText.length,
      generation_duration: 1500,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
    uuidCounter = 0; // Reset counter before each test
  });

  // Test for initial state
  it("should initialize with default values", () => {
    const { result } = renderHook(() => useGenerationView());
    
    expect(result.current.sourceText).toBe("");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.proposals).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.canSaveAccepted).toBe(false);
    expect(result.current.canSaveAll).toBe(false);
  });

  // Test for generating flashcards - success case
  it("should handle flashcard generation successfully", async () => {
    // Setup MSW handler for the request
    server.use(
      http.post("/api/generations", () => {
        return HttpResponse.json(sampleGenerationResponse);
      }),
    );

    const { result } = renderHook(() => useGenerationView());
    
    // Initial checks
    expect(result.current.isLoading).toBe(false);
    expect(result.current.proposals).toHaveLength(0);
    
    // Trigger the generation
    await act(async () => {
      await result.current.handleGenerateSubmit(sampleGenerationCommand);
    });
    
    // Verify state after successful generation
    expect(result.current.isLoading).toBe(false);
    expect(result.current.sourceText).toBe(sampleSourceText);
    expect(result.current.proposals).toHaveLength(2);
    expect(result.current.generationId).toBe(123);
    expect(result.current.error).toBeNull();
    
    // Verify the structure of the proposals
    expect(result.current.proposals[0]).toEqual({
      id: "test-uuid-1",
      front: "Test Front 1",
      back: "Test Back 1",
      originalFront: "Test Front 1",
      originalBack: "Test Back 1",
      status: "pending",
      generation_id: 123,
    });
  });

  // Test for generating flashcards - error case
  it("should handle API errors during generation", async () => {
    // Setup MSW handler to simulate an error
    server.use(
      http.post("/api/generations", () => {
        return new HttpResponse(null, { 
          status: 500,
          statusText: "Server Error",
        });
      }),
    );

    const { result } = renderHook(() => useGenerationView());
    
    // Trigger the generation
    await act(async () => {
      await result.current.handleGenerateSubmit(sampleGenerationCommand);
    });
    
    // Verify error state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain("Error 500");
    expect(result.current.proposals).toHaveLength(0);
  });

  // Test for edit functionality
  it("should handle editing proposals", async () => {
    // Setup MSW handler for the request
    server.use(
      http.post("/api/generations", () => {
        return HttpResponse.json(sampleGenerationResponse);
      }),
    );

    const { result } = renderHook(() => useGenerationView());
    
    // First generate proposals
    await act(async () => {
      await result.current.handleGenerateSubmit(sampleGenerationCommand);
    });
    
    // Make sure we have proposals
    expect(result.current.proposals).toHaveLength(2);
    
    // Edit a proposal
    await act(async () => {
      result.current.handleEditProposal(result.current.proposals[0].id);
    });
    
    // Verify editing state
    expect(result.current.editingProposalId).toBe(result.current.proposals[0].id);
    
    // Save changes to edited proposal
    await act(async () => {
      result.current.handleSaveChanges(
        result.current.proposals[0].id,
        "Updated Front",
        "Updated Back",
      );
    });
    
    // Verify changes are saved
    expect(result.current.editingProposalId).toBeNull();
    expect(result.current.proposals[0].front).toBe("Updated Front");
    expect(result.current.proposals[0].back).toBe("Updated Back");
    expect(result.current.proposals[0].isEdited).toBe(true);
  });

  // Test for accepting flashcard proposals
  it("should handle accepting proposal", async () => {
    // Setup MSW handler for the request
    server.use(
      http.post("/api/generations", () => {
        return HttpResponse.json(sampleGenerationResponse);
      }),
    );
    
    const { result } = renderHook(() => useGenerationView());
    
    // First generate proposals
    await act(async () => {
      await result.current.handleGenerateSubmit(sampleGenerationCommand);
    });
    
    // Store proposal IDs for later reference
    const firstProposalId = result.current.proposals[0].id;
    const secondProposalId = result.current.proposals[1].id;
    
    // Initial check - all proposals should be pending
    expect(result.current.canSaveAccepted).toBe(false);
    expect(result.current.proposals.find(p => p.id === firstProposalId)?.status).toBe("pending");
    expect(result.current.proposals.find(p => p.id === secondProposalId)?.status).toBe("pending");
    
    // Accept first proposal
    await act(async () => {
      result.current.handleAcceptProposal(firstProposalId);
    });
    
    // Verify proposal status and save flag
    expect(result.current.canSaveAccepted).toBe(true);
    expect(result.current.proposals.find(p => p.id === firstProposalId)?.status).toBe("accepted");
    expect(result.current.proposals.find(p => p.id === secondProposalId)?.status).toBe("pending");
  });

  // Test for rejecting flashcard proposals
  it("should handle rejecting proposal", async () => {
    // Setup MSW handler for the request
    server.use(
      http.post("/api/generations", () => {
        return HttpResponse.json(sampleGenerationResponse);
      }),
    );
    
    const { result } = renderHook(() => useGenerationView());
    
    // First generate proposals
    await act(async () => {
      await result.current.handleGenerateSubmit(sampleGenerationCommand);
    });
    
    // Store proposal IDs for later reference
    const firstProposalId = result.current.proposals[0].id;
    const secondProposalId = result.current.proposals[1].id;
    
    // Initial check - all proposals should be pending
    expect(result.current.proposals.find(p => p.id === firstProposalId)?.status).toBe("pending");
    expect(result.current.proposals.find(p => p.id === secondProposalId)?.status).toBe("pending");
    expect(result.current.canSaveAll).toBe(true);
    
    // Reject first proposal
    await act(async () => {
      result.current.handleRejectProposal(firstProposalId);
    });
    
    // Verify proposal status and save flag
    expect(result.current.proposals.find(p => p.id === firstProposalId)?.status).toBe("rejected");
    expect(result.current.proposals.find(p => p.id === secondProposalId)?.status).toBe("pending");
    expect(result.current.canSaveAll).toBe(true); // Can still save all as there's one pending proposal
  });

  // Test for saving flashcards
  it("should save accepted flashcards", async () => {
    // Setup MSW handlers
    server.use(
      http.post("/api/generations", () => {
        return HttpResponse.json({
          generation_id: 123,
          flashcards_proposals: [
            { front: "Front 1", back: "Back 1", source: "ai-full" },
            { front: "Front 2", back: "Back 2", source: "ai-full" },
          ],
          stats: {
            generated_count: 2,
            source_text_length: 1000,
            generation_duration: 1500,
          },
        });
      }),
      
      http.post("/api/flashcards", () => {
        return HttpResponse.json({ status: "success" });
      }),
    );

    // Initialize with proposals
    const { result } = renderHook(() => useGenerationView());
    
    // First generate proposals
    await act(async () => {
      await result.current.handleGenerateSubmit({ source_text: "A".repeat(1000) });
    });
    
    // Accept first proposal
    await act(async () => {
      result.current.handleAcceptProposal(result.current.proposals[0].id);
    });
    
    // Verify canSaveAccepted is true
    expect(result.current.canSaveAccepted).toBe(true);
    
    // Call save accepted
    await act(async () => {
      await result.current.handleSaveAccepted();
    });
    
    // Verify state after save
    expect(result.current.isSaving).toBe(false);
    expect(result.current.proposals).toHaveLength(0);
    expect(result.current.generationId).toBeNull();
  });

  // Test for error handling during save
  it("should handle errors when saving flashcards", async () => {
    // Setup MSW handlers
    server.use(
      http.post("/api/generations", () => {
        return HttpResponse.json({
          generation_id: 123,
          flashcards_proposals: [
            { front: "Front 1", back: "Back 1", source: "ai-full" },
          ],
          stats: {
            generated_count: 1,
            source_text_length: 1000,
            generation_duration: 1500,
          },
        });
      }),
      
      http.post("/api/flashcards", () => {
        return new HttpResponse(null, { 
          status: 500, 
          statusText: "Server Error" 
        });
      }),
    );

    // Initialize with proposals
    const { result } = renderHook(() => useGenerationView());
    
    // First generate proposals
    await act(async () => {
      await result.current.handleGenerateSubmit({ source_text: "A".repeat(1000) });
    });
    
    // Accept the proposal
    await act(async () => {
      result.current.handleAcceptProposal(result.current.proposals[0].id);
    });
    
    // Call save accepted
    await act(async () => {
      await result.current.handleSaveAccepted();
    });
    
    // Verify error state
    expect(result.current.isSaving).toBe(false);
    expect(result.current.error).not.toBeNull();
    expect(result.current.proposals).toHaveLength(1); // Proposals should remain
  });

  // Test for retry functionality
  it("should retry generation with the same source text", async () => {
    // Mock implementation with a counter to track API calls
    let apiCallCount = 0;
    
    // Setup MSW handler for the request - first call succeeds, second call fails
    server.use(
      http.post("/api/generations", () => {
        apiCallCount++;
        
        // First call succeeds to set the source text
        if (apiCallCount === 1) {
          return HttpResponse.json(sampleGenerationResponse);
        }
        
        // Second call fails, simulating an error
        if (apiCallCount === 2) {
          return new HttpResponse(null, { 
            status: 500,
            statusText: "Server Error",
          });
        }
        
        // Third call (retry) succeeds again
        return HttpResponse.json(sampleGenerationResponse);
      }),
    );

    const { result } = renderHook(() => useGenerationView());
    
    // First generation - should succeed and set source text
    await act(async () => {
      await result.current.handleGenerateSubmit(sampleGenerationCommand);
    });
    
    // Verify initial state is good
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.proposals).toHaveLength(2);
    expect(result.current.sourceText).toBe(sampleSourceText);
    
    // Second generation with different text - should fail
    await act(async () => {
      await result.current.handleGenerateSubmit({ source_text: "Different text" });
    });
    
    // Verify error state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain("Error 500");
    
    // Make sure source text is updated to the new text
    expect(result.current.sourceText).toBe("Different text");
    
    // Now retry with the same text that's currently in the source
    await act(async () => {
      await result.current.handleRetryGeneration();
    });
    
    // Verify state after retry
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.proposals).toHaveLength(2);
    
    // Verify we made 3 API calls total
    expect(apiCallCount).toBe(3);
  });
}); 