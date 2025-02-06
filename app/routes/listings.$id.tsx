import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import "@mux/mux-player";
import {
  MapPin,
  Bed,
  Bath,
  CircleDollarSign,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Share2,
  ArrowLeft
} from "lucide-react";
import { Link } from "@remix-run/react";

export async function loader({ params }: LoaderFunctionArgs) {
  const video = await prisma.video.findUnique({
    where: {
      id: params.id,
    },
    include: {
      user: {
        select: {
          email: true,
          companyName: true,
          contactInfo: true,
        },
      },
    },
  });

  if (!video) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ video });
}

export default function ListingPage() {
  const { video } = useLoaderData<typeof loader>();

  return (
    <div className="fixed inset-0 bg-black">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link to="/listings/feed" className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        {/* Video Player */}
        <mux-player
          className="w-full h-full max-h-screen object-contain"
          playback-id={video.muxPlaybackId}
          metadata-video-title={video.title}
          stream-type="on-demand"
          autoplay="muted"
          loop={true}
          defaultHidden={true}
          playsinline={true}
        />
        
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

            {/* Full Description */}
            <div className="text-white/80">
              <p className="whitespace-pre-wrap">{video.description}</p>
            </div>

            {/* Property Manager */}
            <div className="text-sm text-white/70">
              Listed by {video.user.companyName || video.user.email}
            </div>

            {/* Contact Buttons */}
            <div className="flex gap-3 mt-6">
              {video.user.contactInfo ? (
                <>
                  {video.user.contactInfo.includes("@") ? (
                    <a
                      href={`mailto:${video.user.contactInfo}`}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Email Property Manager
                    </a>
                  ) : (
                    <a
                      href={`tel:${video.user.contactInfo.replace(/\D/g, '')}`}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Call Property Manager
                    </a>
                  )}
                </>
              ) : (
                <div className="flex-1 bg-white/10 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 opacity-50">
                  <Mail className="w-4 h-4" />
                  Contact Unavailable
                </div>
              )}
              <button
                onClick={() => {
                  navigator.share?.({
                    title: video.title,
                    text: `Check out this property: ${video.title}`,
                    url: window.location.href,
                  }).catch(() => {
                    // Fallback to copying link
                    navigator.clipboard.writeText(window.location.href);
                  });
                }}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg flex items-center justify-center"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mux-player': any;
    }
  }
} 