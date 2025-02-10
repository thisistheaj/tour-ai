import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { getVideo, updateVideo } from "~/models/video.server";
import { analyzeVideoRooms } from "~/lib/gemini.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const formData = await request.formData();
  const muxPlaybackId = formData.get("muxPlaybackId");
  
  if (typeof muxPlaybackId !== "string") {
    return json({ error: "Mux Playback ID is required" }, { status: 400 });
  }

  try {
    // Analyze rooms using Gemini
    const rooms = await analyzeVideoRooms(muxPlaybackId);

    return json({ success: true, rooms });
  } catch (error) {
    console.error("Error analyzing rooms:", error);
    return json(
      { error: "Error analyzing rooms" },
      { status: 500 }
    );
  }
}; 