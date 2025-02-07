import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/session.server";
import { getVideoListItems } from "~/models/video.server";
import { Button } from "~/components/ui/button";
import { Video, Home, Settings, LogOut, Play, Bed, Bath } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const videos: any[] = await getVideoListItems({ userId: user.id });
  return json({ user, videos });
}

export default function ManagerDashboard() {
  const { videos } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-black border-b border-white/10 z-10">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="font-semibold text-white">TourAI</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" asChild>
                <Link to="/listings/feed">
                  <Play className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" asChild>
                <Link to="/manager/settings">
                  <Settings className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" asChild>
                <Link to="/logout">
                  <LogOut className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20 pb-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-gray-600 mt-1">
            {videos.length > 0 
              ? `You have ${videos.length} property tour${videos.length === 1 ? '' : 's'}`
              : 'Start sharing your properties with video tours'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 mb-8 px">
          <Button 
            size="lg" 
            className="w-full flex items-center justify-start gap-2 h-auto py-6 px-4"
            asChild
          >
            <Link to="/manager/new">
              <Video className="w-6 h-6" />
              <div>
                <div className="font-semibold">Record New Tour</div>
                <div className="text-sm opacity-90">Share your property with potential renters</div>
              </div>
            </Link>
          </Button>

          <Button 
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-start gap-2 h-auto py-6 px-4"
            asChild
          >
            <Link to="/listings/feed">
              <Play className="w-6 h-6" />
              <div>
                <div className="font-semibold">Preview Feed</div>
                <div className="text-sm opacity-90">See how renters view your tours</div>
              </div>
            </Link>
          </Button>
        </div>

        {/* Property Tours List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Property Tours</h2>
            {videos.length > 0 && (
              <span className="text-sm text-gray-500">
                {videos.filter((video: any) => video.available).length} available
              </span>
            )}
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="mb-4">
                <Home className="w-12 h-12 mx-auto text-gray-400" />
              </div>
              <h3 className="font-medium mb-2">No tours yet</h3>
              <p className="text-gray-600 text-sm mb-4">
                Start by recording a tour of your first property
              </p>
              <Button asChild>
                <Link to="/manager/new">Record First Tour</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {videos.map((video: any) => (
                <Link
                  key={video.id}
                  to={`/manager/edit/${video.id}`}
                  className="block aspect-[9/16] relative rounded-lg overflow-hidden group bg-gray-100"
                >
                  {/* Thumbnail */}
                  {video.muxPlaybackId ? (
                    <img
                      src={`https://image.mux.com/${video.muxPlaybackId}/thumbnail.jpg?time=0`}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <p className="text-xs text-gray-500">Processing...</p>
                    </div>
                  )}

                  {/* Title Overlay - Top */}
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent p-2">
                    <h3 className="font-medium text-white text-xs truncate">
                      {video.title}
                    </h3>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white" />
                  </div>

                  {/* Price/Availability Overlay - Bottom */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-2">
                    <div className="flex items-center justify-between gap-1">
                      <div className="min-w-0">
                        <h3 className="font-medium text-white text-sm truncate">
                          ${video.price}/mo
                        </h3>
                      </div>
                      <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] ${
                        video.available 
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {video.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 