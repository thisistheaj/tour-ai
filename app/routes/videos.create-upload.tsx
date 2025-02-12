import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import mux from "~/lib/mux.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireUserId(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ["public"],
      mp4_support: "standard",
      video_quality: "plus",
    },
    cors_origin: "*",
  });

  return json({ url: upload.url, id: upload.id });
}; 