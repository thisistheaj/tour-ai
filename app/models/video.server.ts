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

export function createVideo({
  title,
  userId,
  muxAssetId,
  muxPlaybackId,
  status,
}: Pick<Video, "title" | "muxAssetId" | "muxPlaybackId" | "status"> & {
  userId: User["id"];
}) {
  return prisma.video.create({
    data: {
      title,
      userId,
      muxAssetId,
      muxPlaybackId,
      status,
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