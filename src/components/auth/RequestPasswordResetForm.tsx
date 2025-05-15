import { useState } from "react";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Loader2 } from "lucide-react";

const requestResetSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email"),
});

export default function RequestPasswordResetForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate email
    const result = requestResetSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.format().email?._errors[0] || "Błąd walidacji");
      return;
    }

    setIsLoading(true);
    // Form submission will be handled by auth service
    // For now, simulate success
    setTimeout(() => {
      setSuccess(true);
      setIsLoading(false);
    }, 1000);
  };

  if (success) {
    return (
      <Alert>
        <AlertDescription>
          Jeśli podany adres email istnieje w naszej bazie, otrzymasz na niego
          instrukcje resetowania hasła.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@email.com"
          disabled={isLoading}
          className={error ? "border-red-500" : ""}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wysyłanie...
          </>
        ) : (
          "Wyślij link resetujący"
        )}
      </Button>
    </form>
  );
} 