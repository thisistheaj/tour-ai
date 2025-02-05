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