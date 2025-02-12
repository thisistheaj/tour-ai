import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { analyzeVideo } from "~/lib/gemini.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireUserId(request);

  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const muxPlaybackId = params.muxPlaybackId;
  
  if (typeof muxPlaybackId !== "string") {
    return json({ error: "Mux Playback ID is required" }, { status: 400 });
  }

  try {
    const analysis = await analyzeVideo(muxPlaybackId);
    console.log("\n=== API: Video Analysis Results ===");
    console.log("Video Description:", analysis.videoDescription);
    console.log("Analysis:", {
      rooms: analysis.rooms.length,
      tags: analysis.tags.length,
      hasDescription: !!analysis.videoDescription
    });

    return json({ 
      success: true, 
      rooms: analysis.rooms,
      propertyInfo: analysis.propertyInfo,
      tags: analysis.tags,
      videoDescription: analysis.videoDescription
    });
  } catch (error) {
    console.error("Error analyzing rooms:", error);
    if (error instanceof Error && error.message.includes("Failed to fetch video")) {
      return json({ error: "Video not ready yet" }, { status: 400 });
    }
    return json({ error: "Error analyzing rooms" }, { status: 500 });
  }
}; 