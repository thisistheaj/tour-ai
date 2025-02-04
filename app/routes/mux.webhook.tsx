import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import mux from "~/lib/mux.server";
import { updateVideoMuxInfo } from "~/models/video.server";
import { prisma } from "~/db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await request.text();
  const signature = request.headers.get("mux-signature") || "";

  // Verify webhook signature in production
  const event = JSON.parse(body);

  if (event.type === "video.asset.ready") {
    const assetId = event.data.id;
    const playbackId = event.data.playback_ids[0].id;

    // Find the video with this asset ID and update it
    const video = await prisma.video.findFirst({
      where: { muxAssetId: assetId },
    });

    if (video) {
      await updateVideoMuxInfo({
        id: video.id,
        muxAssetId: assetId,
        muxPlaybackId: playbackId,
        status: "ready",
      });
    }
  }

  return json({ ok: true });
}; 