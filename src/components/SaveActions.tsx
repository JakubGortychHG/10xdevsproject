import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Link } from "./ui/link";

interface SaveActionsProps {
  canSaveAccepted: boolean;
  canSaveAll: boolean;
  isSaving: boolean;
  onSaveAccepted: () => void;
  onSaveAll: () => void;
}

export default function SaveActions({
  canSaveAccepted,
  canSaveAll,
  isSaving,
  onSaveAccepted,
  onSaveAll,
}: SaveActionsProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Zaloguj się aby móc zapisać fiszki do swojej kolekcji.{" "}
          <Link href="/auth/login" className="font-medium underline">
            Zaloguj się
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex justify-end space-x-2">
      <Button
        variant="outline"
        onClick={onSaveAccepted}
        disabled={!canSaveAccepted || isSaving}
      >
        {isSaving ? "Zapisywanie..." : "Zapisz zaakceptowane"}
      </Button>

      <Button onClick={onSaveAll} disabled={!canSaveAll || isSaving}>
        {isSaving ? "Zapisywanie..." : "Zapisz wszystkie"}
      </Button>
    </div>
  );
}
