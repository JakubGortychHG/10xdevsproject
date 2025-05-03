import { Button } from "./ui/button";

interface SaveActionsProps {
  canSaveAccepted: boolean;
  canSaveAll?: boolean;
  isSaving: boolean;
  onSaveAccepted: () => void;
  onSaveAll?: () => void;
}

export default function SaveActions({
  canSaveAccepted,
  canSaveAll,
  isSaving,
  onSaveAccepted,
  onSaveAll,
}: SaveActionsProps) {
  return (
    <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6 mt-4">
      <Button
        variant="default"
        onClick={onSaveAccepted}
        disabled={!canSaveAccepted || isSaving}
      >
        {isSaving ? "Zapisywanie..." : "Zapisz zaakceptowane"}
      </Button>
      
      {canSaveAll && onSaveAll && (
        <Button
          variant="outline"
          onClick={onSaveAll}
          disabled={!canSaveAll || isSaving}
        >
          Zapisz wszystkie
        </Button>
      )}
    </div>
  );
} 