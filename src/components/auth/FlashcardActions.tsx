import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Link } from "@/components/ui/link";

interface FlashcardActionsProps {
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
  id: string;
  status: "accepted" | "rejected" | "pending" | "edited";
}

export default function FlashcardActions({
  onAccept,
  onReject,
  onEdit,
  id,
  status,
}: FlashcardActionsProps) {
  const { user } = useAuth();
  const isAccepted = status === "accepted";
  const isRejected = status === "rejected";

  if (!user) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            Zaloguj się aby móc zapisać tę fiszkę do swojej kolekcji.{" "}
            <Link href="/auth/login" className="font-medium underline">
              Zaloguj się
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex justify-end space-x-2">
      {!isRejected && (
        <Button
          variant={isAccepted ? "default" : "outline"}
          onClick={() => onAccept(id)}
          disabled={isAccepted}
        >
          {isAccepted ? "Zaakceptowano" : "Akceptuj"}
        </Button>
      )}

      {!isAccepted && (
        <Button
          variant={isRejected ? "destructive" : "outline"}
          onClick={() => onReject(id)}
          disabled={isRejected}
        >
          {isRejected ? "Odrzucono" : "Odrzuć"}
        </Button>
      )}

      {!isRejected && (
        <Button variant="outline" onClick={() => onEdit(id)}>
          Edytuj
        </Button>
      )}
    </div>
  );
}
