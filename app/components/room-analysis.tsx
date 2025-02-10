import { useState, useEffect } from "react";
import { Room } from "~/lib/gemini.server";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface RoomAnalysisProps {
  videoId: string;  // This is muxPlaybackId
  onComplete: (rooms: Room[]) => void;
  onSkip: () => void;
}

export function RoomAnalysis({ videoId: muxPlaybackId, onComplete, onSkip }: RoomAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[] | null>(null);

  const analyzeRooms = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-rooms", {
        method: "POST",
        body: new URLSearchParams({ muxPlaybackId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze rooms");
      }

      setRooms(data.rooms);
      onComplete(data.rooms);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze rooms");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    analyzeRooms();
  }, [muxPlaybackId]);

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-center text-sm text-gray-600">
          Analyzing your video to identify rooms...
          <br />
          This may take a minute
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <XCircle className="w-8 h-8 text-destructive" />
        <p className="text-center text-sm text-gray-600">{error}</p>
        <div className="flex gap-2">
          <Button onClick={analyzeRooms} variant="outline">
            Try Again
          </Button>
          <Button onClick={onSkip}>Skip Analysis</Button>
        </div>
      </div>
    );
  }

  if (rooms) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          <p className="text-sm font-medium">Room Analysis Complete</p>
        </div>
        
        <div className="grid gap-2">
          {rooms.map((room, index) => (
            <Card key={index} className="p-3 flex justify-between items-center">
              <span className="font-medium">{room.room}</span>
              <span className="text-sm text-gray-500">{room.timestamp}</span>
            </Card>
          ))}
        </div>

        <Button onClick={() => onComplete(rooms)} className="w-full mt-4">
          Continue
        </Button>
      </div>
    );
  }

  return null;
} 