import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export type Room = {
  room: string;
  timestamp: string;
};

export type VideoAnalysis = {
  rooms: Room[];
  propertyInfo: {
    bedrooms?: number;
    bathrooms?: number;
  };
  tags: string[];
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

export async function analyzeVideo(muxPlaybackId: string): Promise<VideoAnalysis> {
  console.log("\n=== Starting Video Analysis ===");
  console.log(`Analyzing video: ${muxPlaybackId}`);
  
  // Get video from Mux with retries
  const arrayBuffer = await getMuxVideo(muxPlaybackId);
  const base64Data = Buffer.from(arrayBuffer).toString('base64');
  console.log("Video data fetched and converted to base64");
  
  // Initialize Gemini
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.7,
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
            text: `Analyze this apartment tour video and identify:
1. What rooms are shown and at what timestamps
2. The number of bedrooms and bathrooms
3. Notable features, amenities, and style elements

Respond ONLY with a JSON object in this exact format, with no additional text or explanation:

{
  "rooms": [
    {
      "room": "Living Room",
      "timestamp": "0:00"
    }
  ],
  "propertyInfo": {
    "bedrooms": 2,
    "bathrooms": 1.5
  },
  "tags": [
    "washer/dryer",
    "hardwood floors",
    "modern kitchen",
    "stainless appliances"
  ]
}

Notes:
- For rooms that aren't clearly identifiable, use "Room 1", "Room 2", etc.
- Always label bathrooms as "Bathroom" and kitchens as "Kitchen"
- If you can't determine bedrooms or bathrooms count, omit those fields
- Include any notable features, amenities, or style elements as tags
- Keep tags simple and descriptive`
          }
        ],
      }
    ],
  });

  try {
    console.log("Sending request to Gemini...");
    const result = await chatSession.sendMessage("Return the video analysis as JSON");
    const text = result.response.text().trim();
    console.log("\nRaw Gemini Response:");
    console.log(text);
    
    // Try to extract JSON if it's wrapped in other text
    const jsonMatch = text.match(/\{.*\}/s);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }

    const analysis = JSON.parse(jsonMatch[0]) as VideoAnalysis;
    console.log("\nParsed Analysis:");
    console.log(JSON.stringify(analysis, null, 2));
    
    // Validate the structure
    if (!analysis.rooms || !Array.isArray(analysis.rooms) || !analysis.rooms.every(room => 
      typeof room === 'object' && 
      typeof room.room === 'string' && 
      typeof room.timestamp === 'string'
    )) {
      throw new Error("Invalid room data structure");
    }

    // Ensure propertyInfo exists
    analysis.propertyInfo = analysis.propertyInfo || {};
    
    // Ensure tags exist and are strings
    analysis.tags = Array.isArray(analysis.tags) 
      ? analysis.tags.filter(tag => typeof tag === 'string')
      : [];

    console.log("\nFinal Analysis Result:");
    console.log(JSON.stringify({
      rooms: analysis.rooms.length,
      propertyInfo: analysis.propertyInfo,
      tags: analysis.tags.length
    }, null, 2));

    return analysis;
  } catch (error) {
    console.error("\nError during analysis:", error);
    // Return a safe fallback
    const fallback = {
      rooms: [{ room: "Room 1", timestamp: "0:00" }],
      propertyInfo: {},
      tags: []
    };
    console.log("Returning fallback:", fallback);
    return fallback;
  }
}
