import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Video } from "@prisma/client";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: number;
}

export async function getListingResponse(
  question: string,
  listing: Video & { tags?: string[] },
  chatHistory: ChatMessage[] = []
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
    }
  });

  // Format listing data as context
  const listingContext = `
Property Details:
- Title: ${listing.title}
- Price: $${listing.price}/month
- Location: ${listing.address}, ${listing.city}
- Bedrooms: ${listing.bedrooms}
- Bathrooms: ${listing.bathrooms}
- Description: ${listing.description}
- Availability: ${listing.available ? "Available now" : "Not currently available"}

Video Tour Analysis:
- Rooms Shown: ${listing.rooms ? JSON.stringify(listing.rooms, null, 2) : "No room data available"}
- Features & Amenities: ${listing.tags?.join(", ") || "None specified"}

Note: The rooms and features listed above were identified through AI analysis of the video tour, so I can help answer specific questions about what's shown in the video.
`.trim();

  // Format chat history
  const formattedHistory = chatHistory.map(msg => ({
    role: msg.isUser ? "user" : "model",
    parts: [{ text: msg.text }]
  }));

  // Start chat with context and history
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{
          text: `I'm a renter looking at this property. Here's the listing information and video analysis:\n\n${listingContext}\n\nPlease help me learn more about it.`
        }]
      },
      {
        role: "model",
        parts: [{
          text: "I'm here to help you learn about this property. I'll answer your questions based on the listing information provided. I'll be direct, helpful, and honest about what I know and don't know."
        }]
      },
      ...formattedHistory
    ],
  });

  try {
    const result = await chat.sendMessage(question);
    const response = result.response.text();
    return response;
  } catch (error) {
    console.error("Error getting AI response:", error);
    throw new Error("Failed to get response from AI assistant");
  }
} 