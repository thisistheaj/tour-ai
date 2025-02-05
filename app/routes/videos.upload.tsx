import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import "@mux/mux-uploader";
import type { MuxUploaderElement } from "@mux/mux-uploader";
import { requireUserId } from "~/session.server";
import { createVideo } from "~/models/video.server";
import mux from "~/lib/mux.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const muxUploadId = formData.get("muxUploadId");

  if (typeof title !== "string" || typeof muxUploadId !== "string") {
    return json(
      { errors: { title: "Title is required", muxUploadId: "Upload required" } },
      { status: 400 }
    );
  }

  try {
    // Get the upload status from Mux first
    const upload = await mux.video.uploads.retrieve(muxUploadId);
    
    if (!upload.asset_id) {
      return json(
        { errors: { upload: "Video upload not yet processed" } },
        { status: 400 }
      );
    }

    // Get the asset details
    const asset = await mux.video.assets.retrieve(upload.asset_id);
    
    // Create video record with all Mux details
    const video = await createVideo({
      title,
      userId,
      muxAssetId: asset.id,
      muxPlaybackId: asset.playback_ids?.[0]?.id,
      status: asset.status,
    });

    return redirect(`/videos`);
  } catch (error) {
    console.error("Error processing video:", error);
    return json(
      { errors: { upload: "Error processing video upload" } },
      { status: 500 }
    );
  }
};

export default function UploadVideo() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function createUploadUrl() {
      const response = await fetch("/videos/create-upload", { method: "POST" });
      const { url, id } = await response.json();
      setUploadUrl(url);
      setUploadId(id);
    }
    createUploadUrl();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload New Video</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter video title..."
              />
              {actionData?.errors?.title && (
                <Alert variant="destructive">
                  <AlertDescription>{actionData.errors.title}</AlertDescription>
                </Alert>
              )}
            </div>

            {uploadUrl && (
              <div className="space-y-2">
                <Label>Video File</Label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  <mux-uploader
                    className="w-full"
                    endpoint={uploadUrl}
                    onUploadStart={() => setIsUploading(true)}
                    onSuccess={() => setIsUploading(false)}
                    capture="environment"
                    aspect-ratio="9:16"
                    preferred-camera-facing-mode="user"
                  />
                </div>
              </div>
            )}

            <input type="hidden" name="muxUploadId" value={uploadId || ""} />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isUploading || navigation.state === "submitting"}
            >
              {isUploading 
                ? "Uploading..." 
                : navigation.state === "submitting"
                ? "Saving..."
                : "Save Video"
              }
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// Add TypeScript support for the web component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mux-uploader': React.DetailedHTMLProps<React.HTMLAttributes<MuxUploaderElement>, MuxUploaderElement>;
    }
  }
} 