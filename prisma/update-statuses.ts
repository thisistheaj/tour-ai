import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateStatuses() {
  // First, let's see what we have
  const videos = await prisma.video.findMany();
  console.log("Current videos:", videos);

  // Update videos with both status and playback ID
  await prisma.video.updateMany({
    where: {
      muxPlaybackId: null // Update videos that don't have a playback ID
    },
    data: {
      status: "ready",
      muxPlaybackId: "h00YwSIQIvV9VNXi00O4eQcU01IbyTyQvHUAi2nUgpDyJg" // Your Mux playback ID
    }
  });
  
  // Let's verify the update
  const updatedVideos = await prisma.video.findMany();
  console.log("Updated videos:", updatedVideos);
}

async function clearAndShowVideos() {
  // Delete all videos
  await prisma.video.deleteMany({});
  console.log("Cleared all videos");

  // Verify the table is empty
  const videos = await prisma.video.findMany();
  console.log("Current videos:", videos);
}

updateStatuses()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

clearAndShowVideos()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 