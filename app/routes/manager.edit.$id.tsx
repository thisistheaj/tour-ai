import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useNavigation, useActionData } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { getVideo, updateVideo, deleteVideo } from "~/models/video.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
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
import { ArrowLeft, Trash2, CircleDollarSign, MapPin, Bed, Bath, ChevronUp, Mail, Heart, Share2, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "@remix-run/react";
import "@mux/mux-player";
import MuxPlayerElement from "@mux/mux-player";
import { useState } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const videoId = params.id;

  if (!videoId) {
    throw new Error("Video ID is required");
  }

  const video = await getVideo({ id: videoId, userId });
  if (!video) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ video });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const videoId = params.id;

  if (!videoId) {
    throw new Error("Video ID is required");
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  // Handle deletion
  if (intent === "delete") {
    try {
      await deleteVideo({ id: videoId, userId });
      return redirect("/manager");
    } catch (error) {
      console.error("Error deleting listing:", error);
      return json(
        { errors: { delete: "Error deleting listing" } },
        { status: 500 }
      );
    }
  }

  // Handle update (existing code)
  const title = formData.get("title");
  const price = formData.get("price");
  const address = formData.get("address");
  const city = formData.get("city");
  const bedrooms = formData.get("bedrooms");
  const bathrooms = formData.get("bathrooms");
  const description = formData.get("description");
  const available = formData.get("available") === "on";

  if (!title || !price || !address || !city || !bedrooms || !bathrooms || !description) {
    return json(
      { errors: { form: "All fields are required" } },
      { status: 400 }
    );
  }

  try {
    await updateVideo({
      id: videoId,
      userId,
      title: title.toString(),
      price: parseFloat(price.toString()),
      address: address.toString(),
      city: city.toString(),
      bedrooms: parseInt(bedrooms.toString()),
      bathrooms: parseFloat(bathrooms.toString()),
      description: description.toString(),
      available,
    });

    return redirect("/manager");
  } catch (error) {
    console.error("Error updating listing:", error);
    return json(
      { errors: { form: "Error updating listing" } },
      { status: 500 }
    );
  }
}

export default function EditListing() {
  const { video } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const isSubmitting = navigation.state === "submitting";
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="container mx-auto p-4 pb-24">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/manager">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Property Tour</CardTitle>
          <CardDescription>Update your property details and availability</CardDescription>
        </CardHeader>

        <CardContent>
          <Form method="post" className="space-y-6">
            {(actionData?.errors as any)?.form && (
              <Alert variant="destructive">
                <AlertDescription>{(actionData?.errors as any).form}</AlertDescription>
              </Alert>
            )}

            {/* Video Preview */}
            <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden mx-auto max-w-sm">
              {video.muxPlaybackId && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <mux-player
                    stream-type="on-demand"
                    playback-id={video.muxPlaybackId}
                    metadata-video-title={video.title}
                    className="w-full h-full object-contain"
                    autoplay="muted"
                    loop={true}
                    defaultHidden={true}
                    playsinline={true}
                  />
                </div>
              )}
              
              {/* Property Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent">
                <div className="p-6 space-y-3">
                  {/* Price and Availability */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <CircleDollarSign className="w-5 h-5" />
                      <span className="text-2xl font-bold">${video.price}/mo</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                      video.available 
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {video.available 
                        ? <><CheckCircle2 className="w-4 h-4" /> Available</>
                        : <><XCircle className="w-4 h-4" /> Not Available</>
                      }
                    </span>
                  </div>

                  {/* Title and Location */}
                  <div>
                    <h2 className="text-xl font-semibold text-white">{video.title}</h2>
                    <div className="flex items-center gap-1 text-white/80 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{video.address}</span>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{video.bedrooms} beds</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>{video.bathrooms} baths</span>
                    </div>
                  </div>

                  {/* Description Preview */}
                  <div className="text-white/80">
                    <p className="line-clamp-2">{video.description}</p>
                    <div className="text-sm text-white/60 mt-1 flex items-center gap-1">
                      Preview Only <ChevronUp className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Actions Preview */}
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
            </div>

            {/* Property Name */}
            <div className="space-y-2">
              <Label htmlFor="title">Property Name</Label>
              <Input
                id="title"
                name="title"
                defaultValue={video.title}
                placeholder="e.g., Luxury Downtown Loft, Modern South Austin Home..."
                required
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Monthly Rent</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={video.price?.toString()}
                placeholder="Enter monthly rent..."
                required
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                defaultValue={video.address || ""}
                placeholder="Enter property address..."
                required
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select name="city" defaultValue={video.city || "austin"} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="austin">Austin, Texas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  defaultValue={video.bedrooms?.toString()}
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
                  defaultValue={video.bathrooms?.toString()}
                  placeholder="# of bathrooms"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={video.description || ""}
                placeholder="Enter property description..."
                required
              />
            </div>

            {/* Availability */}
            <div className="flex items-center space-x-2">
              <Switch id="available" name="available" defaultChecked={video.available} />
              <Label htmlFor="available">Available for rent</Label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button 
                type="button" 
                variant="destructive"
                className="flex items-center gap-2"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete Tour
              </Button>

              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property Tour</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property tour? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <Form method="post">
            <input type="hidden" name="intent" value="delete" />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Tour"}
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Add TypeScript support for the web component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mux-player': React.DetailedHTMLProps<React.HTMLAttributes<MuxPlayerElement>, MuxPlayerElement>;
    }
  }
} 