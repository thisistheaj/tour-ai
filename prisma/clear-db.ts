import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log("Starting database clear...");

    // Delete in order to respect foreign key constraints
    const deletedVideos = await prisma.video.deleteMany({});
    console.log(`Deleted ${deletedVideos.count} videos`);

    const deletedNotes = await prisma.note.deleteMany({});
    console.log(`Deleted ${deletedNotes.count} notes`);

    const deletedPasswords = await prisma.password.deleteMany({});
    console.log(`Deleted ${deletedPasswords.count} passwords`);

    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`Deleted ${deletedUsers.count} users`);

    console.log("Database clear complete!");

  } catch (error) {
    console.error("Error clearing database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if called directly (not imported)
if (require.main === module) {
  clearDatabase();
}

// Export for use in admin routes
export { clearDatabase }; 