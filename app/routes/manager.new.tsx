import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import "@mux/mux-uploader";
import type { MuxUploaderElement } from "@mux/mux-uploader";
import "@mux/mux-player";
import type { MuxPlayerElement } from "@mux/mux-player";
import { requireUserId } from "~/session.server";
import { createVideo } from "~/models/video.server";
import mux from "~/lib/mux.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { CheckCircle2, Maximize2, Heart, MessageCircle, Share2 } from "lucide-react";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const muxUploadId = formData.get("muxUploadId");
  const step = formData.get("step");

  // Step 1: Video Upload
  if (step === "1") {
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
    
      // Store asset details in session or return them to be stored in form state
      return json({ 
        success: true,
        assetId: asset.id,
        playbackId: asset.playback_ids?.[0]?.id,
      status: asset.status,
        title: title
    });
  } catch (error) {
    console.error("Error processing video:", error);
    return json(
      { errors: { upload: "Error processing video upload" } },
      { status: 500 }
    );
  }
  }

  // Step 2: Property Details
  if (step === "2") {
    const price = formData.get("price");
    const address = formData.get("address");
    const city = formData.get("city");
    const bedrooms = formData.get("bedrooms");
    const bathrooms = formData.get("bathrooms");
    const description = formData.get("description");
    const available = formData.get("available") === "true";
    const assetId = formData.get("assetId");
    const playbackId = formData.get("playbackId");

    if (!price || !address || !city || !bedrooms || !bathrooms || !description || !assetId || !playbackId) {
      return json(
        { errors: { form: "All fields are required" } },
        { status: 400 }
      );
    }

    try {
      await createVideo({
        title: title as string,
        userId,
        muxAssetId: assetId as string,
        muxPlaybackId: playbackId as string,
        status: "ready",
        price: parseFloat(price as string),
        address: address as string,
        city: city as string,
        bedrooms: parseInt(bedrooms as string),
        bathrooms: parseInt(bathrooms as string),
        description: description as string,
        available,
      });

      return redirect("/manager/listings");
    } catch (error) {
      console.error("Error creating listing:", error);
      return json(
        { errors: { form: "Error creating listing" } },
        { status: 500 }
      );
    }
  }

  return json({ errors: { form: "Invalid step" } }, { status: 400 });
};

export default function NewListing() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [videoData, setVideoData] = useState<{
    assetId: string;
    playbackId: string;
    status: string;
    title: string;
  } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const stepTitles = {
    1: { title: "Record Tour", description: "Share a video walkthrough of your property" },
    2: { title: "Property Info", description: "Tell renters about your property" },
    3: { title: "Preview Tour", description: "See how your tour will look to renters" }
  };

  useEffect(() => {
    async function createUploadUrl() {
      const response = await fetch("/videos/create-upload", { method: "POST" });
      const { url, id } = await response.json();
      setUploadUrl(url);
      setUploadId(id);
    }
    createUploadUrl();
  }, []);

  // Handle successful video upload
  useEffect(() => {
    if (actionData?.success && actionData.assetId) {
      setVideoData({
        assetId: actionData.assetId,
        playbackId: actionData.playbackId,
        status: actionData.status,
        title: actionData.title
      });
      setStep(2);
    }
  }, [actionData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    
    if (step === 2) {
      // Store form data and move to confirmation step
      setFormData(Object.fromEntries(data.entries()));
      setStep(3);
    } else if (step === 3) {
      // Final submission
      const form = document.createElement('form');
      form.method = 'post';
      
      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });
      
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } else {
      // Step 1 (video upload)
      e.currentTarget.submit();
    }
  };

  const toggleFullscreen = (videoElement: HTMLVideoElement) => {
    if (!document.fullscreenElement) {
      videoElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="container mx-auto p-4 pb-24">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{stepTitles[step].title}</CardTitle>
          <CardDescription>{stepTitles[step].description}</CardDescription>
        </CardHeader>

        <CardContent>
          <Form method="post" onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="step" value={step} />
            {videoData && (
              <>
                <input type="hidden" name="assetId" value={videoData.assetId} />
                <input type="hidden" name="playbackId" value={videoData.playbackId} />
                <input type="hidden" name="title" value={videoData.title} />
              </>
            )}

            {step === 1 ? (
              <>
            <div className="space-y-2">
                  <Label htmlFor="title">Property Name</Label>
              <Input
                id="title"
                name="title"
                    placeholder="e.g., Luxury Downtown Loft, Modern South Austin Home..."
              />
              {actionData?.errors?.title && (
                <Alert variant="destructive">
                  <AlertDescription>{actionData.errors.title}</AlertDescription>
                </Alert>
              )}
            </div>

            {uploadUrl && (
              <div className="space-y-2">
                    <Label>Property Tour</Label>
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
              </>
            ) : step === 2 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="price">Monthly Rent</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter monthly rent..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Enter property address..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Select name="city" defaultValue="austin" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="austin">Austin, Texas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      min="0"
                      placeholder="# of bedrooms"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="# of bathrooms"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter property description..."
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="available" name="available" defaultChecked />
                  <Label htmlFor="available">Ready to show</Label>
                </div>
              </>
            ) : (
              // Step 3: Preview
              <div className="space-y-6">
                {/* Video Preview with TikTok-style UI */}
                <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
                  <mux-player
                    className="w-full h-full object-contain"
                    playback-id={videoData?.playbackId}
                    metadata-video-title={videoData?.title}
                    stream-type="on-demand"
                    autoplay="muted"
                    loop={true}
                    defaultHidden={true}
                    playsinline={true}
                  />
                  
                  {/* Video Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="text-white">
                      <h2 className="text-lg font-bold">${formData?.price}/month</h2>
                      <p className="text-sm opacity-80">
                        {formData?.bedrooms} beds • {formData?.bathrooms} baths • {formData?.address}
                      </p>
                      <p className="text-sm mt-2 line-clamp-2">
                        {formData?.description}
                      </p>
                    </div>
                  </div>

                  {/* Side Actions */}
                  <div className="absolute right-4 bottom-20 flex flex-col gap-6">
                    <button type="button" className="group flex flex-col items-center gap-1">
                      <div className="p-3 rounded-full bg-white/10 text-white 
                        group-hover:bg-white/20 transition-colors">
                        <Heart className="w-6 h-6" />
                      </div>
                      <span className="text-white text-xs">Like</span>
                    </button>

                    <button type="button" className="group flex flex-col items-center gap-1">
                      <div className="p-3 rounded-full bg-white/10 text-white 
                        group-hover:bg-white/20 transition-colors">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <span className="text-white text-xs">Comment</span>
                    </button>

                    <button type="button" className="group flex flex-col items-center gap-1">
                      <div className="p-3 rounded-full bg-white/10 text-white 
                        group-hover:bg-white/20 transition-colors">
                        <Share2 className="w-6 h-6" />
                      </div>
                      <span className="text-white text-xs">Share</span>
                    </button>
                  </div>
                </div>

                {/* Property Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium">Tour Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Property</Label>
                      <p className="text-gray-600">{videoData?.title}</p>
                    </div>
                    <div>
                      <Label>Area</Label>
                      <p className="text-gray-600">{formData?.city}</p>
                    </div>
                    <div>
                      <Label>Availability</Label>
                      <p className="text-gray-600">{formData?.available ? "Ready to show" : "Not available"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between pt-4">
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
            <Button 
              type="submit" 
                className={step === 1 ? "w-full" : ""}
              disabled={isUploading || navigation.state === "submitting"}
            >
              {isUploading 
                ? "Uploading..." 
                : navigation.state === "submitting"
                  ? "Posting..."
                  : step === 1
                  ? "Continue to Property Details"
                  : step === 2
                  ? "Preview Tour"
                  : "Share Tour"
              }
            </Button>
            </div>
          </Form>
        </CardContent>
      </Card>

      {/* Success Message */}
      <Dialog open={navigation.state === "loading"}>
        <DialogContent>
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <DialogTitle>Tour Posted!</DialogTitle>
            <DialogDescription>
              Your property tour is now live and ready for renters to view.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fixed Progress Steps */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                1
              </div>
              <span className="text-xs mt-1 font-medium">Tour</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                2
              </div>
              <span className="text-xs mt-1 font-medium">Info</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                3
              </div>
              <span className="text-xs mt-1 font-medium">Preview</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add TypeScript support for the web component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mux-uploader': React.DetailedHTMLProps<React.HTMLAttributes<MuxUploaderElement>, MuxUploaderElement>;
      'mux-player': React.DetailedHTMLProps<React.HTMLAttributes<MuxPlayerElement>, MuxPlayerElement>;
    }
  }
} 