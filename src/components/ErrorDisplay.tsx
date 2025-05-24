import { toast } from "sonner";

/**
 * Utility for displaying error messages with toast notifications
 */
const ErrorDisplay = {
  /**
   * Shows a generation error message with retry option
   */
  showGenerationError: (errorMessage: string, onRetry?: () => void) => {
    toast.error(errorMessage, {
      description: "Wystąpił błąd podczas generowania fiszek.",
      action: onRetry
        ? {
            label: "Spróbuj ponownie",
            onClick: onRetry,
          }
        : undefined,
    });
  },

  /**
   * Shows a save error message
   */
  showSaveError: (errorMessage: string) => {
    toast.error("Błąd zapisu", {
      description: errorMessage || "Wystąpił błąd podczas zapisywania fiszek.",
    });
  },

  /**
   * Shows a success message
   */
  showSuccess: (message: string) => {
    toast.success("Sukces", {
      description: message,
    });
  },
};

export default ErrorDisplay;
