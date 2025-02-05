import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import "@mux/mux-player";
import type { MuxPlayerElement } from "@mux/mux-player";
import { useState } from "react";
import { prisma } from "~/db.server";
import {
  Heart,
  MessageCircle,
  Share2,
  ChevronUp,
  ChevronDown,
  ArrowLeft
} from "lucide-react";
import { Link } from "@remix-run/react";

export const loader = async () => {
  const videos = await prisma.video.findMany({
    where: {
      status: "ready",
      muxPlaybackId: { not: null }
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return json({ videos });
};

export default function FeedPage() {
  const { videos } = useLoaderData<typeof loader>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction: number) => {
    if (direction > 0 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction < 0 && currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link to="/videos" className="text-white">
          <ArrowLeft className="w-6 h-6" />
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
                handleSwipe(swipe);
              }
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <mux-player
                className="w-full h-full max-h-screen object-contain"
                playback-id={video.muxPlaybackId}
                metadata-video-title={video.title}
                stream-type="on-demand"
                autoplay={index === currentIndex ? "muted" : "false"}
                loop={true}
                defaultHidden={true}
                playsinline={true}
              />
              
              {/* Video Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <div className="text-white">
                  <h2 className="text-lg font-bold">{video.title}</h2>
                  <p className="text-sm opacity-80">
                    Uploaded by {video.user.email}
                  </p>
                </div>
              </div>

              {/* Side Actions */}
              <div className="absolute right-4 bottom-20 flex flex-col gap-6">
                <button className="group flex flex-col items-center gap-1">
                  <div className="p-3 rounded-full bg-white/10 text-white 
                    group-hover:bg-white/20 transition-colors">
                    <Heart className="w-6 h-6" />
                  </div>
                  <span className="text-white text-xs">123</span>
                </button>

                <button className="group flex flex-col items-center gap-1">
                  <div className="p-3 rounded-full bg-white/10 text-white 
                    group-hover:bg-white/20 transition-colors">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-white text-xs">45</span>
                </button>

                <button className="group flex flex-col items-center gap-1">
                  <div className="p-3 rounded-full bg-white/10 text-white 
                    group-hover:bg-white/20 transition-colors">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <span className="text-white text-xs">Share</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Navigation Hints */}
      <div className="absolute inset-x-0 top-1/2 flex justify-between px-4 pointer-events-none text-white/50">
        {currentIndex > 0 && (
          <div className="flex items-center gap-2">
            <ChevronUp className="w-6 h-6" />
            <span>Previous</span>
          </div>
        )}
        {currentIndex < videos.length - 1 && (
          <div className="flex items-center gap-2 ml-auto">
            <span>Next</span>
            <ChevronDown className="w-6 h-6" />
          </div>
        )}
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