-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "address" TEXT,
ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "bathrooms" INTEGER,
ADD COLUMN     "bedrooms" INTEGER,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "price" DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "Video_city_idx" ON "Video"("city");
