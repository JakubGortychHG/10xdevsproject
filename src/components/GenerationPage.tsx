import { useGenerationView } from "../lib/hooks/useGenerationView";
import SourceTextInputForm from "./SourceTextInputForm";
import LoadingIndicator from "./LoadingIndicator";
import FlashcardProposalList from "./FlashcardProposalList";
import SaveActions from "./SaveActions";
import EditProposalModal from "./EditProposalModal";
import { Toaster } from "sonner";
import ErrorDisplay from "./ErrorDisplay";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";

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

  // Helper function to get error message and action
  const getErrorInfo = () => {
    if (!error) return null;

    const message = error.message.toLowerCase();
    
    if (message.includes("network error") || message.includes("temporarily unavailable")) {
      return {
        message: "Nie udało się połączyć z serwisem AI. Spróbuj ponownie za chwilę.",
        action: handleRetryGeneration,
        actionLabel: "Spróbuj ponownie",
      };
    }

    if (message.includes("rate limit")) {
      return {
        message: "Przekroczono limit zapytań. Poczekaj chwilę i spróbuj ponownie.",
        action: handleRetryGeneration,
        actionLabel: "Spróbuj ponownie",
      };
    }

    if (message.includes("generate")) {
      return {
        message: "Nie udało się wygenerować fiszek. Spróbuj ponownie.",
        action: handleRetryGeneration,
        actionLabel: "Spróbuj ponownie",
      };
    }

    if (message.includes("save") || message.includes("zapisywanie")) {
      return {
        message: "Wystąpił błąd podczas zapisywania fiszek.",
        action: null,
        actionLabel: null,
      };
    }

    return {
      message: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
      action: handleRetryGeneration,
      actionLabel: "Spróbuj ponownie",
    };
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="space-y-8">
      <SourceTextInputForm
        onSubmit={handleGenerateSubmit}
        isLoading={isLoading}
        initialText={sourceText}
      />
      
      {isLoading && <LoadingIndicator />}
      
      {error && errorInfo && (
        <Alert variant="destructive" className="animate-in fade-in">
          <AlertDescription className="flex items-center justify-between">
            <span>{errorInfo.message}</span>
            {errorInfo.action && (
              <Button
                variant="outline"
                size="sm"
                onClick={errorInfo.action}
                className="ml-4"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {errorInfo.actionLabel}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      
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