import FlashcardProposalCard from "./FlashcardProposalCard";
import type { FlashcardProposalViewModel } from "../types";

interface FlashcardProposalListProps {
  proposals: FlashcardProposalViewModel[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function FlashcardProposalList({
  proposals,
  onAccept,
  onReject,
  onEdit,
}: FlashcardProposalListProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold mb-4">Propozycje fiszek ({proposals.length})</h2>
      
      <div className="divide-y divide-gray-100">
        {proposals.map((proposal) => (
          <FlashcardProposalCard
            key={proposal.id}
            proposal={proposal}
            onAccept={onAccept}
            onReject={onReject}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
} 