import { useState, useCallback } from "react";
import type { FlashcardProposalViewModel } from "../../types";
import type {
  GenerateFlashcardsCommand,
  FlashcardCreateDto,
  Source,
} from "../../types";
import ErrorDisplay from "../../components/ErrorDisplay";

/**
 * Custom hook for managing the state and logic of the generation view
 */
export function useGenerationView() {
  // State
  const [sourceText, setSourceText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [proposals, setProposals] = useState<FlashcardProposalViewModel[]>([]);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(
    null,
  );

  // Handler for form submission - Generates flashcard proposals
  const handleGenerateSubmit = useCallback(
    async (data: GenerateFlashcardsCommand) => {
      setSourceText(data.source_text);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        const { generation_id, flashcards_proposals } = responseData;

        setGenerationId(generation_id);

        // Map API response to ViewModel
        const proposalsWithIds: FlashcardProposalViewModel[] =
          flashcards_proposals.map((proposal: any) => ({
            id: crypto.randomUUID(),
            front: proposal.front,
            back: proposal.back,
            originalFront: proposal.front,
            originalBack: proposal.back,
            status: "pending",
            generation_id,
          }));

        setProposals(proposalsWithIds);
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Handler for accepting a proposal
  const handleAcceptProposal = useCallback((id: string) => {
    setProposals((prevProposals) =>
      prevProposals.map((proposal) =>
        proposal.id === id ? { ...proposal, status: "accepted" } : proposal,
      ),
    );
  }, []);

  // Handler for rejecting a proposal
  const handleRejectProposal = useCallback((id: string) => {
    setProposals((prevProposals) =>
      prevProposals.map((proposal) =>
        proposal.id === id ? { ...proposal, status: "rejected" } : proposal,
      ),
    );
  }, []);

  // Handler for editing a proposal
  const handleEditProposal = useCallback((id: string) => {
    setEditingProposalId(id);
  }, []);

  // Handler for canceling edit
  const handleCancelEdit = useCallback(() => {
    setEditingProposalId(null);
  }, []);

  // Handler for saving changes to a proposal
  const handleSaveChanges = useCallback(
    (id: string, updatedFront: string, updatedBack: string) => {
      setProposals((prevProposals) =>
        prevProposals.map((proposal) =>
          proposal.id === id
            ? {
                ...proposal,
                front: updatedFront,
                back: updatedBack,
                // Status remains the same, editing doesn't auto-accept
                // Only mark as edited to track that content was modified
                isEdited: true,
              }
            : proposal,
        ),
      );

      setEditingProposalId(null);
    },
    [],
  );

  // Handler for saving accepted and edited proposals
  const handleSaveAccepted = useCallback(async () => {
    if (!generationId) return;

    setIsSaving(true);
    setError(null);

    try {
      const acceptedProposals = proposals.filter(
        (p) => p.status === "accepted",
      );

      const flashcardsToCreate: FlashcardCreateDto[] = acceptedProposals.map(
        (proposal) => ({
          front: proposal.front,
          back: proposal.back,
          source: proposal.isEdited ? "ai-edited" : ("ai-full" as Source),
          generation_id: generationId,
        }),
      );

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flashcards: flashcardsToCreate }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Clear proposals after successful save
      setProposals([]);
      setGenerationId(null);

      // Show success toast
      ErrorDisplay.showSuccess("Fiszki zostały pomyślnie zapisane");
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      ErrorDisplay.showSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  }, [generationId, proposals]);

  // Handler for saving all non-rejected proposals
  const handleSaveAll = useCallback(async () => {
    // First mark all non-rejected proposals as accepted
    const updatedProposals = proposals.map((proposal) =>
      proposal.status !== "rejected"
        ? { ...proposal, status: "accepted" }
        : proposal,
    );

    // Update state
    setProposals(updatedProposals);

    // Use the updated proposals directly for saving
    if (!generationId) return;

    setIsSaving(true);
    setError(null);

    try {
      const flashcardsToCreate: FlashcardCreateDto[] = updatedProposals
        .filter((p) => p.status === "accepted")
        .map((proposal) => ({
          front: proposal.front,
          back: proposal.back,
          source: proposal.isEdited ? "ai-edited" : ("ai-full" as Source),
          generation_id: generationId,
        }));

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flashcards: flashcardsToCreate }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Clear proposals after successful save
      setProposals([]);
      setGenerationId(null);

      // Show success toast
      ErrorDisplay.showSuccess("Wszystkie fiszki zostały pomyślnie zapisane");
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      ErrorDisplay.showSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  }, [generationId, proposals]);

  // Handler for retrying generation
  const handleRetryGeneration = useCallback(() => {
    setError(null);
    handleGenerateSubmit({ source_text: sourceText });
  }, [sourceText, handleGenerateSubmit]);

  // Derived values
  const proposalToEdit = editingProposalId
    ? proposals.find((p) => p.id === editingProposalId)
    : undefined;

  const canSaveAccepted = proposals.some(
    (p) => p.status === "accepted" || p.status === "edited",
  );

  const canSaveAll = proposals.some((p) => p.status === "pending");

  return {
    sourceText,
    isLoading,
    isSaving,
    proposals,
    generationId,
    error,
    editingProposalId,
    proposalToEdit,
    canSaveAccepted,
    canSaveAll,
    handleGenerateSubmit,
    handleAcceptProposal,
    handleRejectProposal,
    handleEditProposal,
    handleCancelEdit,
    handleSaveChanges,
    handleSaveAccepted,
    handleSaveAll,
    handleRetryGeneration,
  };
}
