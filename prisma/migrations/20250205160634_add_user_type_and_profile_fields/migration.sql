-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('PROPERTY_MANAGER', 'RENTER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "city" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "contactInfo" TEXT,
ADD COLUMN     "userType" "UserType";
