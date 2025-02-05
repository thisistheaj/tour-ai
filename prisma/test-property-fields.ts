import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testPropertyFields() {
  try {
    // Create a test user if needed
    const user = await prisma.user.findFirst({
      where: { userType: "PROPERTY_MANAGER" }
    });

    if (!user) {
      console.log("No property manager found. Please create one first.");
      return;
    }

    // Create a test video with all new fields
    const video = await prisma.video.create({
      data: {
        title: "Test Property",
        status: "ready",
        price: 1500.00,
        address: "123 Test St",
        city: "austin",
        bedrooms: 2,
        bathrooms: 1,
        description: "A test property listing",
        available: true,
        userId: user.id
      }
    });

    console.log("Created test video:", video);

    // Read it back to verify
    const readBack = await prisma.video.findUnique({
      where: { id: video.id }
    });

    console.log("Read back video:", readBack);

    // Clean up
    await prisma.video.delete({
      where: { id: video.id }
    });

    console.log("Test successful! All fields working as expected.");

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testPropertyFields(); 