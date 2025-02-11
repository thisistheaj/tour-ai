import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export type Room = {
  room: string;
  timestamp: string;
};

export async function isMuxVideoReady(muxPlaybackId: string, maxAttempts = 100): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const muxUrl = `https://stream.mux.com/${muxPlaybackId}/capped-1080p.mp4?download=true`;
      const response = await fetch(muxUrl);
      if (!response.ok) {
        if (attempt === maxAttempts - 1) {
          throw new Error(`Failed to check video status after ${maxAttempts} attempts`);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      return !!response.ok;
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw new Error(`Failed to check video status after ${maxAttempts} attempts`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      continue;
    }
  }
  return false;
}

export async function getMuxVideo(muxPlaybackId: string, maxAttempts = 10): Promise<ArrayBuffer> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const muxUrl = `https://stream.mux.com/${muxPlaybackId}/capped-1080p.mp4?download=true`;
      const response = await fetch(muxUrl);
      
      if (!response.ok) {
        if (attempt === maxAttempts - 1) {
          throw new Error(`Failed to fetch video after ${maxAttempts} attempts`);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      return await response.arrayBuffer();
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error("Failed to fetch video");
}

export async function analyzeVideo(muxPlaybackId: string): Promise<Room[]> {
  // Get video from Mux with retries
  const arrayBuffer = await getMuxVideo(muxPlaybackId);
  const base64Data = Buffer.from(arrayBuffer).toString('base64');
  
  // Initialize Gemini
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.7, // Lower temperature for more consistent output
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
    }
  });

  // Start chat session
  const chatSession = model.startChat({
    history: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "video/mp4",
              data: base64Data
            }
          }
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: `Analyze this apartment tour video and identify what rooms are shown and at what timestamps.
Respond ONLY with a JSON array in this exact format, with no additional text or explanation:
[{"room": "Living Room", "timestamp": "0:00"}, {"room": "Kitchen", "timestamp": "1:23"}].
For rooms that aren't clearly identifiable, use "Room 1", "Room 2", etc.
Always label bathrooms as "Bathroom" and kitchens as "Kitchen".`
          }
        ],
      }
    ],
  });

  try {
    const result = await chatSession.sendMessage("Return the room analysis as JSON");
    const text = result.response.text().trim();
    
    // Try to extract JSON if it's wrapped in other text
    const jsonMatch = text.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error("No JSON array found in response");
    }

    const rooms = JSON.parse(jsonMatch[0]);
    
    // Validate the structure
    if (!Array.isArray(rooms) || !rooms.every(room => 
      typeof room === 'object' && 
      typeof room.room === 'string' && 
      typeof room.timestamp === 'string'
    )) {
      throw new Error("Invalid room data structure");
    }

    return rooms;
  } catch (error) {
    console.error("Failed to parse room data:", error);
    // Return a safe fallback
    return [{ room: "Room 1", timestamp: "0:00" }];
  }
}
