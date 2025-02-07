import { json, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import "@mux/mux-player";
import MuxPlayerElement from "@mux/mux-player";
import { useState } from "react";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";
import { isListingSaved, saveListing, unsaveListing } from "~/models/video.server";
import type { Video } from "@prisma/client";
import {
  Heart,
  Share2,
  Phone,
  ChevronUp,
  ChevronDown,
  Settings,
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  CircleDollarSign,
  CheckCircle2,
  XCircle,
  ChevronUpIcon,
  Mail
} from "lucide-react";
import { Link } from "@remix-run/react";

export const loader = async ({ request }: { request: Request }) => {
  const user = await requireUser(request);
  const videos = await prisma.video.findMany({
    where: {
      status: "ready",
      muxPlaybackId: { not: null }
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
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get saved state for each video
  const savedStates = await Promise.all(
    videos.map((video: Video) => isListingSaved(user.id, video.id))
  );

  return json({ videos, savedStates, userId: user.id, userType: user.userType });
};

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const videoId = formData.get("videoId");
  const action = formData.get("action");

  if (!videoId || typeof videoId !== "string") {
    return json({ error: "Invalid video ID" }, { status: 400 });
  }

  if (action === "save") {
    await saveListing(user.id, videoId);
    return json({ saved: true });
  } else if (action === "unsave") {
    await unsaveListing(user.id, videoId);
    return json({ saved: false });
  }

  return json({ error: "Invalid action" }, { status: 400 });
}

export default function FeedPage() {
  const { videos, savedStates, userId, userType } = useLoaderData<typeof loader>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const fetcher = useFetcher();

  const handleSwipe = (direction: string) => {
    if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'down' && currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'up' && currentIndex === 0) {
      setCurrentIndex(videos.length - 1);
    } else if (direction === 'down' && currentIndex === videos.length - 1) {
      setCurrentIndex(0);
    }
  };

  const handleSave = (videoId: string, currentlySaved: boolean) => {
    fetcher.submit(
      {
        videoId,
        action: currentlySaved ? "unsave" : "save",
      },
      { method: "post" }
    );
  };

  return (
    <div className="fixed inset-0 bg-black">
      {/* Navigation Bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
        <div className="w-[88px]">
          <AnimatePresence>
            {!showFullDescription && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {userType === "PROPERTY_MANAGER" ? (
                  <Link 
                    to="/manager" 
                    className="text-white flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back</span>
                  </Link>
                ) : (
                  <Link 
                    to="/listings/settings" 
                    className="text-white flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Link 
          to="/listings/saved" 
          className="text-white flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
        >
          <Heart className="w-4 h-4" />
          <span className="text-sm">Saved</span>
        </Link>
      </div>

      <AnimatePresence initial={false}>
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentIndex ? 1 : 0,
              pointerEvents: index === currentIndex ? "auto" : "none"
            }}
            exit={{ opacity: 0 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.y) * velocity.y;
              if (Math.abs(swipe) > 50000) {
                const direction = swipe > 0 ? 'up' : 'down';
                handleSwipe(direction);
              }
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {index === currentIndex ? 
                <mux-player
                  className="w-full h-full max-h-screen object-contain"
                  playback-id={video.muxPlaybackId}
                  metadata-video-title={video.title}
                  stream-type="on-demand"
                  autoplay="muted"
                  loop={true}
                  defaultHidden={true}
                  playsinline={true}
                /> : 
                <mux-player
                  className="w-full h-full max-h-screen object-contain"
                  playback-id={video.muxPlaybackId}
                  metadata-video-title={video.title}
                  stream-type="on-demand"
                  loop={true}
                  defaultHidden={true}
                  playsinline={true}
                />
              }
              {/* Property Info Overlay */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent"
              >
                <div className="p-6 space-y-3">
                  {/* Price and Availability */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <CircleDollarSign className="w-5 h-5" />
                      <span className="text-2xl font-bold">${video.price}/mo</span>
                    </div>
                  </div>

                  {/* Title and Location */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-white">{video.title}</h2>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm ${
                        video.available 
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {video.available 
                          ? <><CheckCircle2 className="w-3 h-3" /> Available</>
                          : <><XCircle className="w-3 h-3" /> Not Available</>
                        }
                      </span>
                    </div>
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
                  <div className="text-white/80" onClick={() => setShowFullDescription(!showFullDescription)}>
                    <p className="line-clamp-2">{video.description}</p>
                    <button className="text-sm text-white/60 mt-1 flex items-center gap-1">
                      Tap for details <ChevronUpIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Property Manager */}
                  <div className="text-sm text-white/70">
                    Listed by {video.user.companyName || video.user.email}
                  </div>
                </div>
              </div>

              {/* Full Description Panel */}
              <AnimatePresence>
                {showFullDescription && (
                  <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ 
                      type: "spring", 
                      damping: 30,
                      stiffness: 150,
                      mass: 1.2,
                      duration: 0.5
                    }}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm p-6 overflow-y-auto"
                    onClick={() => setShowFullDescription(false)}
                  >
                    <div className="max-w-2xl mx-auto space-y-6 py-12">
                      {/* Property Title */}
                      <div>
                        <h2 className="text-2xl font-bold text-white">{video.title}</h2>
                        <div className="flex items-center gap-1 text-white/80 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{video.address}</span>
                        </div>
                      </div>

                      {/* Key Details */}
                      <div className="flex items-center gap-6 text-white/90">
                        <div className="flex items-center gap-2">
                          <CircleDollarSign className="w-5 h-5" />
                          <span className="text-xl font-semibold">${video.price}/mo</span>
                        </div>
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
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">About this property</h3>
                        <p className="text-white/80 whitespace-pre-wrap">{video.description}</p>
                      </div>

                      {/* Contact Section */}
                      <div className="border-t border-white/10 pt-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Contact Property Manager</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="text-white font-medium">{video.user.companyName}</div>
                            <div className="text-white/60">{video.user.email}</div>
                            {video.user.contactInfo && (
                              <div className="text-white/60">{video.user.contactInfo}</div>
                            )}
                          </div>
                          <div className="flex gap-3">
                            {video.user.contactInfo?.includes("@") ? (
                              <a
                                href={`mailto:${video.user.contactInfo}`}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                              >
                                <Mail className="w-4 h-4" />
                                Email
                              </a>
                            ) : (
                              <a
                                href={`tel:${video.user.contactInfo}`}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                              >
                                <Phone className="w-4 h-4" />
                                Call
                              </a>
                            )}
                            <button 
                              onClick={() => {
                                const shareUrl = `${window.location.origin}/listings/${video.id}`;
                                navigator.share?.({
                                  title: video.title,
                                  text: `Check out this property: ${video.title}`,
                                  url: shareUrl,
                                }).catch(() => {
                                  // Fallback to copying link
                                  navigator.clipboard.writeText(shareUrl);
                                });
                              }}
                              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                            >
                              <Share2 className="w-4 h-4" />
                              Share
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-white/60 text-sm mt-8">
                        Tap anywhere to close
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Side Actions */}
              <AnimatePresence>
                {!showFullDescription && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-4 bottom-32 flex flex-col gap-6"
                  >
                    <button 
                      onClick={() => handleSave(video.id, savedStates[index])}
                      className="group flex flex-col items-center gap-1"
                    >
                      <div className={`p-3 rounded-full ${
                        savedStates[index]
                          ? 'bg-red-500 text-white'
                          : 'bg-white/10 text-white group-hover:bg-white/20'
                        } transition-colors`}
                      >
                        <Heart className={`w-6 h-6 ${
                          savedStates[index] ? 'fill-current' : ''
                        }`} />
                      </div>
                      <span className="text-white text-xs">
                        {savedStates[index] ? 'Saved' : 'Save'}
                      </span>
                    </button>

                    {video.user.contactInfo ? (
                      video.user.contactInfo.includes("@") ? (
                        <a
                          href={`mailto:${video.user.contactInfo}`}
                          className="group flex flex-col items-center gap-1"
                        >
                          <div className="p-3 rounded-full bg-white/10 text-white 
                            group-hover:bg-white/20 transition-colors">
                            <Mail className="w-6 h-6" />
                          </div>
                          <span className="text-white text-xs">Email</span>
                        </a>
                      ) : (
                        <a
                          href={`tel:${video.user.contactInfo.replace(/\D/g, '')}`}
                          className="group flex flex-col items-center gap-1"
                        >
                          <div className="p-3 rounded-full bg-white/10 text-white 
                            group-hover:bg-white/20 transition-colors">
                            <Phone className="w-6 h-6" />
                          </div>
                          <span className="text-white text-xs">Call</span>
                        </a>
                      )
                    ) : (
                      <Link
                        to={`/listings/${video.id}`}
                        className="group flex flex-col items-center gap-1"
                      >
                        <div className="p-3 rounded-full bg-white/10 text-white 
                          group-hover:bg-white/20 transition-colors">
                          <Mail className="w-6 h-6" />
                        </div>
                        <span className="text-white text-xs">Contact</span>
                      </Link>
                    )}

                    <button 
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/listings/${video.id}`;
                        navigator.share?.({
                          title: video.title,
                          text: `Check out this property: ${video.title}`,
                          url: shareUrl,
                        }).catch(() => {
                          navigator.clipboard.writeText(shareUrl);
                        });
                      }}
                      className="group flex flex-col items-center gap-1"
                    >
                      <div className="p-3 rounded-full bg-white/10 text-white 
                        group-hover:bg-white/20 transition-colors">
                        <Share2 className="w-6 h-6" />
                      </div>
                      <span className="text-white text-xs">Share</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}