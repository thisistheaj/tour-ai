import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearVideos() {
  try {
    // First check existing videos
    const existingVideos = await prisma.video.findMany();
    console.log("Existing videos before deletion:", existingVideos);

    // Delete all videos
    const deletedCount = await prisma.video.deleteMany({});
    console.log(`Deleted ${deletedCount.count} videos`);

    // Verify the table is empty
    const remainingVideos = await prisma.video.findMany();
    console.log("Remaining videos:", remainingVideos);

  } catch (error) {
    console.error("Error clearing videos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearVideos(); 