import { useState, useEffect } from "react";
import { Room } from "~/lib/gemini.server";
import { Button } from "~/components/ui/button";
import { Brain, Video, X, XCircle } from "lucide-react";
import { cn } from "~/lib/utils";

function useAnimatedEllipsis() {
  const [dots, setDots] = useState('.');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return dots;
}

interface RoomAnalysisProps {
  videoId: string;  // This is muxPlaybackId
  onComplete: (rooms: Room[]) => void;
  onSkip: () => void;
}

export function RoomAnalysis({ videoId: muxPlaybackId, onComplete, onSkip }: RoomAnalysisProps) {
  const [isWaitingForMux, setIsWaitingForMux] = useState(true);
  const [isAIWatching, setIsAIWatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  const dots = useAnimatedEllipsis();

  const analyzeRooms = async () => {
    setIsWaitingForMux(true);
    setIsAIWatching(false);
    setError(null);

    try {
      let response = await fetch(`/api/videos/${muxPlaybackId}/ready`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to start room identification");
      }

      setIsWaitingForMux(false);
      setIsAIWatching(true);
      
      response = await fetch(`/api/videos/${muxPlaybackId}/analyze`, {
        method: "GET",
      });



      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setRooms(data.rooms);
      setSelectedRooms(data.rooms);
      setIsAIWatching(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to identify rooms");
      setIsWaitingForMux(false);
      setIsAIWatching(false);
    }
  };

  useEffect(() => {
    analyzeRooms();
  }, [muxPlaybackId]);

  const toggleRoom = (room: Room) => {
    setSelectedRooms(prev => 
      prev.find(r => r.room === room.room && r.timestamp === room.timestamp)
        ? prev.filter(r => !(r.room === room.room && r.timestamp === room.timestamp))
        : [...prev, room]
    );
  };

  if (isWaitingForMux) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="relative">
          <Video className="w-12 h-12 text-primary animate-pulse" />
          <div className="absolute inset-0 w-12 h-12 bg-primary/20 rounded-full animate-ping" />
        </div>
        <p className="text-center text-sm text-gray-600">
          Sending video tour to AI{dots}
        </p>
      </div>
    );
  }

  if (isAIWatching) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="relative">
          <Brain className="w-12 h-12 text-primary animate-pulse" />
          <div className="absolute inset-0 w-12 h-12 bg-primary/20 rounded-full animate-ping" />
        </div>
        <p className="text-center text-sm text-gray-600">
          AI is watching your video{dots}
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
          <Button onClick={onSkip}>Skip</Button>
        </div>
      </div>
    );
  }

  if (rooms) {
    return (
      <div className="space-y-6 p-4">
        <div className="space-y-2">
          <h3 className="font-medium">Identified Rooms</h3>
          <p className="text-sm text-gray-500">Select the rooms you want to include in your tour.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {rooms.map((room, index) => {
            const isSelected = selectedRooms.some(
              r => r.room === room.room && r.timestamp === room.timestamp
            );
            return (
              <button
                key={index}
                onClick={() => toggleRoom(room)}
                className={cn(
                  "group flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors",
                  isSelected
                    ? "bg-slate-800 text-white hover:bg-slate-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <span>{room.room}</span>
                <span className="text-xs opacity-60">{room.timestamp}</span>
                <X className={cn(
                  "w-4 h-4 transition-colors",
                  isSelected
                    ? "text-white/60 group-hover:text-white"
                    : "text-gray-400 group-hover:text-gray-600"
                )} />
              </button>
            );
          })}
        </div>

        <div className="flex justify-between pt-4">
          <Button onClick={onSkip} variant="outline">
            Skip
          </Button>
          <Button 
            onClick={() => onComplete(selectedRooms)}
            disabled={selectedRooms.length === 0}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return null;
} 