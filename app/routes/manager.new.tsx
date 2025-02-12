import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import "@mux/mux-uploader";
import "@mux/mux-player";
import { requireUserId } from "~/session.server";
import { createVideo } from "~/models/video.server";
import mux from "~/lib/mux.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { CheckCircle2, Heart, Share2, Bed, Bath, ChevronUp, Mail, Play } from "lucide-react";
import { AddressPicker } from "~/components/ui/address-picker";
import { RoomAnalysis } from "~/components/room-analysis";
import type { Room, VideoAnalysis } from "~/lib/gemini.server";

interface FormFields {
  title?: string;
  price?: string;
  address?: string;
  city?: string;
  bedrooms?: string;
  bathrooms?: string;
  description?: string;
  available?: string;
  [key: string]: string | undefined;
}

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

  // Step 3: Property Details & Final Submission
  if (step === "3") {
    const title = formData.get("title") as string;
    const assetId = formData.get("assetId") as string;
    const playbackId = formData.get("playbackId") as string;
    const price = formData.get("price") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const bedrooms = formData.get("bedrooms") as string;
    const bathrooms = formData.get("bathrooms") as string;
    const description = formData.get("description") as string;
    const available = formData.get("available") === "on";
    const rooms = JSON.parse(formData.get("rooms") as string);
    const tags = JSON.parse(formData.get("tags") as string);
    const propertyInfo = JSON.parse(formData.get("propertyInfo") as string);

    if (!title || !assetId || !playbackId || !price || !address || !city || !bedrooms || !bathrooms || !description) {
      return json(
        { errors: { form: "All fields are required" } },
        { status: 400 }
      );
    }

    try {
      await createVideo({
        title,
        userId,
        muxAssetId: assetId,
        muxPlaybackId: playbackId,
        status: "ready",
        price: parseFloat(price),
        address,
        city,
        bedrooms: parseInt(bedrooms, 10),
        bathrooms: parseFloat(bathrooms),
        description,
        available,
        rooms,
        tags,
        propertyInfo
      });

      return redirect("/manager");
    } catch (error) {
      console.error("Error creating video:", error);
      return json(
        { errors: { form: "Error creating listing" } },
        { status: 500 }
      );
    }
  }

  return json({ errors: { form: "Invalid step" } }, { status: 400 });
};

export async function loader() {
  return json({
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY
  });
}

export default function NewListing() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { GOOGLE_PLACES_API_KEY } = useLoaderData<typeof loader>();
  const [step, setStep] = useState(1);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<FormFields | null>(null);
  const [videoData, setVideoData] = useState<{
    assetId: string;
    playbackId: string;
    status: string;
    title: string;
  } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedCity, setSelectedCity] = useState("austin");
  const [analyzedRooms, setAnalyzedRooms] = useState<VideoAnalysis | null>(null);

  const stepTitles = {
    1: { title: "Record Tour", description: "Share a video walkthrough of your property" },
    2: { title: "Analyze Rooms", description: "Let AI identify rooms in your tour" },
    3: { title: "Property Info", description: "Tell renters about your property" },
    4: { title: "Preview Tour", description: "See how your tour will look to renters" }
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
    if ((actionData as any)?.success && (actionData as any).assetId) {
      setVideoData({
        assetId: (actionData as any).assetId,
        playbackId: (actionData as any).playbackId,
        status: (actionData as any).status,
        title: (actionData as any).title
      });
      setStep(2); // Move to room analysis
    }
  }, [actionData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataObj = Object.fromEntries(new FormData(e.currentTarget)) as FormFields;
    
    if (step === 3) {
      // Store form data and move to confirmation step
      setFormData(formDataObj);
      setStep(4);
    } else if (step === 4) {
      // Final submission - include analysis data
      const form = document.createElement('form');
      form.method = 'post';
      
      // Add form fields
      if (formData) {
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
          }
        });
      }

      // Add analysis data
      if (analyzedRooms) {
        const roomsInput = document.createElement('input');
        roomsInput.type = 'hidden';
        roomsInput.name = 'rooms';
        roomsInput.value = JSON.stringify(analyzedRooms.rooms);
        form.appendChild(roomsInput);

        const tagsInput = document.createElement('input');
        tagsInput.type = 'hidden';
        tagsInput.name = 'tags';
        tagsInput.value = JSON.stringify(analyzedRooms.tags);
        form.appendChild(tagsInput);

        const propertyInfoInput = document.createElement('input');
        propertyInfoInput.type = 'hidden';
        propertyInfoInput.name = 'propertyInfo';
        propertyInfoInput.value = JSON.stringify(analyzedRooms.propertyInfo);
        form.appendChild(propertyInfoInput);
      }
      
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } else {
      // Step 1 (video upload)
      e.currentTarget.submit();
    }
  };

  const handleAddressSelect = (address: string, city: string) => {
    setSelectedAddress(address);
    setSelectedCity(city.toLowerCase());
  };

  return (
    <div className="container mx-auto p-4 pb-24">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{stepTitles[step as keyof typeof stepTitles].title}</CardTitle>
          <CardDescription>{stepTitles[step as keyof typeof stepTitles].description}</CardDescription>
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
              {(actionData as any)?.errors?.title && (
                <Alert variant="destructive">
                  <AlertDescription>{(actionData as any).errors.title}</AlertDescription>
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
              <RoomAnalysis
                videoId={videoData?.playbackId || ""}
                onComplete={(analysis) => {
                  setAnalyzedRooms(analysis);
                  // Pre-fill bedrooms and bathrooms if detected
                  if (analysis.propertyInfo.bedrooms || analysis.propertyInfo.bathrooms) {
                    setFormData(prev => ({
                      ...prev,
                      bedrooms: analysis.propertyInfo.bedrooms?.toString() || "",
                      bathrooms: analysis.propertyInfo.bathrooms?.toString() || ""
                    }));
                  }
                  setStep(3);
                }}
                onSkip={() => setStep(3)}
              />
            ) : step === 3 ? (
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

                <AddressPicker
                  onAddressSelect={handleAddressSelect}
                  apiKey={GOOGLE_PLACES_API_KEY || ""}
                />

                <input type="hidden" name="address" value={selectedAddress} />
                <input type="hidden" name="city" value={selectedCity} />

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
                      defaultValue={formData?.bedrooms || ""}
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
                      defaultValue={formData?.bathrooms || ""}
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
              // Step 4: Preview
              <div className="space-y-6">
                {/* Video Preview */}
                <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden mx-auto max-w-sm">
                  <div className="absolute inset-0 flex items-center justify-center">
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
                  </div>
                  
                  {/* Property Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent">
                    <div className="p-6 space-y-3">
                      {/* Price and Availability */}
                      <div className="flex items-center justify-between">
                        <div className="text-white">
                          <span className="text-2xl font-bold">${formData?.price || '0'}/mo</span>
                        </div>
                      </div>

                      {/* Title and Location */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold text-white">{videoData?.title || 'Property Title'}</h2>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-300">
                            <CheckCircle2 className="w-3 h-3" /> Available
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-white/80 mt-1">
                          <span>{formData?.address || 'Property Address'}</span>
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="flex items-center gap-4 text-white/90">
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{formData?.bedrooms || '0'} beds</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{formData?.bathrooms || '0'} baths</span>
                        </div>
                      </div>

                      {/* Description Preview */}
                      <div className="text-white/80">
                        <p className="line-clamp-2">{formData?.description || 'Property description will appear here'}</p>
                        <div className="text-sm text-white/60 mt-1 flex items-center gap-1">
                          Preview Only <ChevronUp className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Side Actions */}
                  <div className="absolute right-4 bottom-32 flex flex-col gap-6">
                    <div className="group flex flex-col items-center gap-1">
                      <div className="p-3 rounded-full bg-white/10 text-white">
                        <Heart className="w-6 h-6" />
                      </div>
                      <span className="text-white text-xs">Save</span>
                    </div>

                    <div className="group flex flex-col items-center gap-1">
                      <div className="p-3 rounded-full bg-white/10 text-white">
                        <Mail className="w-6 h-6" />
                      </div>
                      <span className="text-white text-xs">Contact</span>
                    </div>

                    <div className="group flex flex-col items-center gap-1">
                      <div className="p-3 rounded-full bg-white/10 text-white">
                        <Share2 className="w-6 h-6" />
                      </div>
                      <span className="text-white text-xs">Share</span>
                    </div>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white" />
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
            
            {/* Only show navigation buttons for steps 1, 3, and 4 */}
            {step !== 2 && (
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
                      ? "Continue to Room Analysis"
                      : step === 3
                      ? "Preview Tour"
                      : "Share Tour"
                  }
                </Button>
              </div>
            )}
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'bg-slate-800 border-slate-800 text-white' : 'border-gray-300'}`}>
                1
              </div>
              <span className="text-xs mt-1 font-medium">Tour</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 mb-4 ${step >= 2 ? 'bg-slate-800' : 'bg-gray-300'}`} />
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-slate-800 border-slate-800 text-white' : 'border-gray-300'}`}>
                2
              </div>
              <span className="text-xs mt-1 font-medium">AI</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 mb-4 ${step >= 3 ? 'bg-slate-800' : 'bg-gray-300'}`} />
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'bg-slate-800 border-slate-800 text-white' : 'border-gray-300'}`}>
                3
              </div>
              <span className="text-xs mt-1 font-medium">Listing</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 mb-4 ${step >= 4 ? 'bg-slate-800' : 'bg-gray-300'}`} />
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 4 ? 'bg-slate-800 border-slate-800 text-white' : 'border-gray-300'}`}>
                4
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
      'mux-uploader': any;
    }
  }
} 