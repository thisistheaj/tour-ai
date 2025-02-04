import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import "@mux/mux-player";
import { MuxPlayerElement } from "@mux/mux-player";
import { requireUserId } from "~/session.server";
import { getVideoListItems } from "~/models/video.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const videos = await getVideoListItems({ userId });
  return json({ videos });
};

export default function VideoList() {
  const { videos } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Your Videos</h2>
        <Button asChild>
          <Link to="upload">Upload New Video</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{video.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {video.muxPlaybackId ? (
                <div className="aspect-video">
                  <mux-player
                    className="w-full h-full"
                    playback-id={video.muxPlaybackId}
                    metadata-video-title={video.title}
                    stream-type="on-demand"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">Processing...</p>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Status: {video.status}
                </span>
                <Button variant="outline" size="sm">
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mux-player': React.DetailedHTMLProps<React.HTMLAttributes<MuxPlayerElement>, MuxPlayerElement>;
    }
  }
} 