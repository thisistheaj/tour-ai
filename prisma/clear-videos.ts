import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearVideos() {
  try {
    const result = await prisma.video.deleteMany({});
    console.log(`Cleared ${result.count} videos from the database`);
  } catch (error) {
    console.error("Failed to clear videos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearVideos(); 