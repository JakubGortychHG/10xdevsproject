import { useState } from "react";
import { z } from "zod";
import { Button } from "./ui/button";
import type { GenerateFlashcardsCommand } from "../types";

// Validation schema
const formSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Tekst źródłowy musi zawierać co najmniej 1000 znaków")
    .max(10000, "Tekst źródłowy nie może przekraczać 10000 znaków"),
});

interface SourceTextInputFormProps {
  onSubmit: (data: GenerateFlashcardsCommand) => void;
  isLoading: boolean;
  initialText?: string;
}

export default function SourceTextInputForm({
  onSubmit,
  isLoading,
  initialText = "",
}: SourceTextInputFormProps) {
  const [text, setText] = useState(initialText);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    const result = formSchema.safeParse({ source_text: text });

    if (!result.success) {
      // Extract and display the first error message
      const formattedError = result.error.format();
      setError(
        formattedError.source_text?._errors[0] ||
          "Nieprawidłowy tekst źródłowy",
      );
      return;
    }

    // Submit validated data
    onSubmit({ source_text: text });
  };

  const charCount = text.length;
  const isValidLength = charCount >= 1000 && charCount <= 10000;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-testid="source-form"
    >
      <div className="space-y-2">
        <div className="flex justify-between">
          <label htmlFor="source-text" className="text-sm font-medium">
            Tekst źródłowy
          </label>
          <span
            className={`text-sm ${isValidLength ? "text-gray-500" : "text-red-500"}`}
          >
            {charCount}/10000 znaków
          </span>
        </div>

        <textarea
          id="source-text"
          className={`w-full min-h-[200px] p-3 border rounded-md ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Wklej tekst, z którego chcesz wygenerować fiszki (min. 1000 znaków)"
          value={text}
          onChange={handleChange}
          disabled={isLoading}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <Button
        type="submit"
        disabled={isLoading || !isValidLength}
        className="w-full sm:w-auto"
      >
        {isLoading ? "Generowanie..." : "Generuj fiszki"}
      </Button>
    </form>
  );
}
