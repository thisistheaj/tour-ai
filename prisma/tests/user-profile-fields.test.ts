import { PrismaClient, UserType } from "@prisma/client";

const prisma = new PrismaClient();

async function testSchema() {
  try {
    console.log("Testing schema changes...\n");

    // Test creating a property manager
    const pm = await prisma.user.create({
      data: {
        email: "pm@test.com",
        userType: UserType.PROPERTY_MANAGER,
        companyName: "Test Properties",
        contactInfo: "555-0123"
      }
    });
    console.log("Created PM:", pm);

    // Test creating a renter
    const renter = await prisma.user.create({
      data: {
        email: "renter@test.com",
        userType: UserType.RENTER,
        city: "San Francisco"
      }
    });
    console.log("\nCreated Renter:", renter);

    // Test querying with new fields
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { userType: UserType.PROPERTY_MANAGER },
          { city: "San Francisco" }
        ]
      }
    });
    console.log("\nQueried Users:", users);

    // Cleanup
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["pm@test.com", "renter@test.com"]
        }
      }
    });
    console.log("\nTest users cleaned up");

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testSchema(); 