import { useGenerationView } from "../lib/hooks/useGenerationView";
import SourceTextInputForm from "./SourceTextInputForm";
import LoadingIndicator from "./LoadingIndicator";
import FlashcardProposalList from "./FlashcardProposalList";
import SaveActions from "./SaveActions";
import EditProposalModal from "./EditProposalModal";
import { Toaster } from "sonner";
import ErrorDisplay from "./ErrorDisplay";

export default function GenerationPage() {
  const {
    sourceText,
    isLoading,
    isSaving,
    proposals,
    error,
    proposalToEdit,
    handleGenerateSubmit,
    handleAcceptProposal,
    handleRejectProposal,
    handleEditProposal,
    handleCancelEdit,
    handleSaveChanges,
    handleSaveAccepted,
    handleSaveAll,
    handleRetryGeneration,
    canSaveAccepted,
    canSaveAll,
  } = useGenerationView();

  // Show error messages if present
  if (error) {
    if (error.message.includes("generate")) {
      ErrorDisplay.showGenerationError(
        "Nie udało się wygenerować fiszek.",
        handleRetryGeneration,
      );
    } else {
      ErrorDisplay.showSaveError("Wystąpił błąd podczas zapisywania fiszek.");
    }
  }

  return (
    <div className="space-y-8">
      <SourceTextInputForm
        onSubmit={handleGenerateSubmit}
        isLoading={isLoading}
        initialText={sourceText}
      />
      
      {isLoading && <LoadingIndicator />}
      
      {!isLoading && proposals.length > 0 && (
        <>
          <FlashcardProposalList
            proposals={proposals}
            onAccept={handleAcceptProposal}
            onReject={handleRejectProposal}
            onEdit={handleEditProposal}
          />
          
          <SaveActions
            canSaveAccepted={canSaveAccepted}
            canSaveAll={canSaveAll}
            isSaving={isSaving}
            onSaveAccepted={handleSaveAccepted}
            onSaveAll={handleSaveAll}
          />
        </>
      )}
      
      <EditProposalModal
        proposal={proposalToEdit}
        onClose={handleCancelEdit}
        onSave={handleSaveChanges}
      />
      
      <Toaster />
    </div>
  );
} 