import type { User, Video } from "@prisma/client";
import { prisma } from "~/db.server";

export function getVideo({
  id,
  userId,
}: Pick<Video, "id"> & {
  userId: User["id"];
}) {
  return prisma.video.findFirst({
    where: { id, userId },
  });
}

export function getVideoListItems({ userId }: { userId: User["id"] }) {
  return prisma.video.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export type { Video } from "@prisma/client";

interface CreateVideoInput {
  title: string;
  userId: string;
  muxAssetId: string;
  muxPlaybackId: string;
  status: string;
  price?: number;
  address?: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
  available?: boolean;
  rooms?: any;
  tags?: string[];
  videoDescription?: string;
  propertyInfo?: {
    bedrooms?: number;
    bathrooms?: number;
  };
}

export async function createVideo({
  userId,
  ...input
}: CreateVideoInput) {
  return prisma.video.create({
    data: {
      ...input,
      user: {
        connect: { id: userId }
      }
    },
  });
}

export function updateVideoMuxInfo({
  id,
  muxAssetId,
  muxPlaybackId,
  status,
}: Pick<Video, "id" | "muxAssetId" | "muxPlaybackId" | "status">) {
  return prisma.video.update({
    where: { id },
    data: { muxAssetId, muxPlaybackId, status },
  });
}

interface UpdateVideoInput {
  id: string;
  userId: string;
  title: string;
  price?: number;
  address?: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
  available?: boolean;
  rooms?: any;
}

export async function updateVideo({
  id,
  userId,
  ...input
}: UpdateVideoInput) {
  return prisma.video.update({
    where: { 
      id,
      userId // Ensure user owns the video
    },
    data: input,
  });
}

export async function deleteVideo({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  return prisma.video.delete({
    where: { 
      id,
      userId // Ensure user owns the video
    },
  });
}

export async function getSavedListings(userId: string) {
  return prisma.savedListing.findMany({
    where: { userId },
    include: {
      video: {
        include: {
          user: {
            select: {
              email: true,
              companyName: true,
              contactInfo: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function isListingSaved(userId: string, videoId: string) {
  const savedListing = await prisma.savedListing.findUnique({
    where: {
      userId_videoId: {
        userId,
        videoId,
      },
    },
  });
  return !!savedListing;
}

export async function saveListing(userId: string, videoId: string) {
  try {
    return await prisma.savedListing.create({
      data: {
        userId,
        videoId,
      },
    });
  } catch (error: any) {
    // If already saved, just return the existing record
    if (error.code === 'P2002') {
      return await prisma.savedListing.findFirst({
        where: {
          userId,
          videoId,
        },
      });
    }
    throw error;
  }
}

export async function unsaveListing(userId: string, videoId: string) {
  try {
    return await prisma.savedListing.delete({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });
  } catch (error: any) {
    // If not found, just return null
    if (error.code === 'P2025') {
      return null;
    }
    throw error;
  }
} 