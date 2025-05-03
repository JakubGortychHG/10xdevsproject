import { Card } from "./ui/card";

export default function LoadingIndicator() {
  // Create an array of 3 items to simulate multiple flashcard skeletons
  const skeletons = Array(3).fill(null);

  return (
    <div className="space-y-4">
      <div className="h-6 bg-gray-200 animate-pulse rounded-md w-48 mb-2"></div>
      
      {skeletons.map((_, index) => (
        <Card key={index} className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 animate-pulse rounded-md w-1/3"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded-md w-full"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded-md w-3/4"></div>
          </div>
          
          <div className="border-t border-gray-200 my-2"></div>
          
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 animate-pulse rounded-md w-1/4"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded-md w-full"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded-md w-5/6"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded-md w-2/3"></div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <div className="h-9 bg-gray-200 animate-pulse rounded-md w-24"></div>
            <div className="h-9 bg-gray-200 animate-pulse rounded-md w-24"></div>
            <div className="h-9 bg-gray-200 animate-pulse rounded-md w-24"></div>
          </div>
        </Card>
      ))}
    </div>
  );
} 