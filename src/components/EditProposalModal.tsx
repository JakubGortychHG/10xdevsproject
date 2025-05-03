import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FlashcardProposalViewModel } from "../types";

// Validation schema for flashcard content
const formSchema = z.object({
  front: z
    .string()
    .max(200, "Przód fiszki może zawierać maksymalnie 200 znaków"),
  back: z
    .string()
    .max(500, "Tył fiszki może zawierać maksymalnie 500 znaków"),
});

interface EditProposalModalProps {
  proposal: FlashcardProposalViewModel | undefined;
  onClose: () => void;
  onSave: (id: string, front: string, back: string) => void;
}

export default function EditProposalModal({
  proposal,
  onClose,
  onSave,
}: EditProposalModalProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [frontError, setFrontError] = useState<string | null>(null);
  const [backError, setBackError] = useState<string | null>(null);
  const isOpen = Boolean(proposal);

  // Update form when the proposal changes
  useEffect(() => {
    if (proposal) {
      setFront(proposal.front);
      setBack(proposal.back);
      setFrontError(null);
      setBackError(null);
    }
  }, [proposal]);

  const handleFrontChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFront(e.target.value);
    setFrontError(null);
  };

  const handleBackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBack(e.target.value);
    setBackError(null);
  };

  const handleSave = () => {
    if (!proposal) return;

    // Validate inputs
    const result = formSchema.safeParse({ front, back });

    if (!result.success) {
      const formattedErrors = result.error.format();
      if (formattedErrors.front?._errors.length) {
        setFrontError(formattedErrors.front._errors[0]);
      }
      if (formattedErrors.back?._errors.length) {
        setBackError(formattedErrors.back._errors[0]);
      }
      return;
    }

    // Call the onSave handler with the updated values
    onSave(proposal.id, front, back);
  };

  const frontCharCount = front.length;
  const backCharCount = back.length;
  const isFrontValid = frontCharCount <= 200;
  const isBackValid = backCharCount <= 500;
  const canSave = isFrontValid && isBackValid && frontCharCount > 0 && backCharCount > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
          <DialogDescription>
            Zmień zawartość fiszki poniżej. Kliknij &quot;Zapisz zmiany&quot; gdy skończysz.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="front" className="text-sm font-medium">
                Przód fiszki
              </label>
              <span
                className={`text-sm ${isFrontValid ? "text-gray-500" : "text-red-500"}`}
              >
                {frontCharCount}/200 znaków
              </span>
            </div>
            <textarea
              id="front"
              value={front}
              onChange={handleFrontChange}
              className={`w-full min-h-[100px] p-3 border rounded-md ${
                frontError ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Przód fiszki (np. słowo lub wyrażenie)"
            />
            {frontError && <p className="text-sm text-red-500">{frontError}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="back" className="text-sm font-medium">
                Tył fiszki
              </label>
              <span
                className={`text-sm ${isBackValid ? "text-gray-500" : "text-red-500"}`}
              >
                {backCharCount}/500 znaków
              </span>
            </div>
            <textarea
              id="back"
              value={back}
              onChange={handleBackChange}
              className={`w-full min-h-[150px] p-3 border rounded-md ${
                backError ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Tył fiszki (np. tłumaczenie, definicja lub wyjaśnienie)"
            />
            {backError && <p className="text-sm text-red-500">{backError}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 