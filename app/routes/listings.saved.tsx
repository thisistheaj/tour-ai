import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { getSavedListings } from "~/models/video.server";
import { ArrowLeft } from "lucide-react";

export async function loader({ request }: { request: Request }) {
  const userId = await requireUserId(request);
  const savedListings = await getSavedListings(userId);
  return json({ savedListings });
}

export default function SavedListings() {
  const { savedListings } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center gap-4">
            <Link to="/listings/feed" className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-semibold">Saved Properties</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20 pb-8">
        {savedListings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 mb-4">No saved properties yet</p>
            <Link 
              to="/listings/feed"
              className="inline-block bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {savedListings.map(({ video }) => (
              <Link
                key={video.id}
                to={`/listings/${video.id}`}
                className="block bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-colors"
              >
                <div className="flex gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="relative aspect-[9/16] w-24 bg-black rounded overflow-hidden">
                    {video.muxPlaybackId && (
                      <img
                        src={`https://image.mux.com/${video.muxPlaybackId}/thumbnail.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-medium text-lg truncate">{video.title}</h2>
                    <p className="text-white/60 text-sm mt-1">
                      {video.bedrooms} beds • {video.bathrooms} baths
                    </p>
                    <p className="text-white/60 text-sm truncate">
                      {video.address}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        video.available 
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {video.available ? 'Available' : 'Not Available'}
                      </span>
                      <span className="text-white/60 text-sm">
                        ${video.price}/month
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 