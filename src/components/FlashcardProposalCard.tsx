import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import type { FlashcardProposalViewModel } from "../types";

interface FlashcardProposalCardProps {
  proposal: FlashcardProposalViewModel;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function FlashcardProposalCard({
  proposal,
  onAccept,
  onReject,
  onEdit,
}: FlashcardProposalCardProps) {
  const { id, front, back, status, isEdited } = proposal;
  
  // Determine card and button states based on status
  const isAccepted = status === "accepted";
  const isRejected = status === "rejected";
  const isPending = status === "pending";
  
  // Card style based on status
  const cardClassName = isAccepted 
    ? "border-green-400" 
    : isRejected 
      ? "border-red-400 opacity-60" 
      : "border-gray-200";
  
  return (
    <Card className={`mb-4 ${cardClassName}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Front</h3>
            <p className="text-base">{front}</p>
            {isEdited && proposal.front !== proposal.originalFront && (
              <div className="text-xs text-gray-500 mt-1 italic">
                (zedytowano)
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-100 my-2" />
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Back</h3>
            <p className="text-base">{back}</p>
            {isEdited && proposal.back !== proposal.originalBack && (
              <div className="text-xs text-gray-500 mt-1 italic">
                (zedytowano)
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2 border-t border-gray-100 pt-3">
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
          <Button
            variant="outline"
            onClick={() => onEdit(id)}
          >
            Edytuj
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 