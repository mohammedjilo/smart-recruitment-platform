-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "stateCode" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "stateCode" TEXT;

-- CreateIndex
CREATE INDEX "Company_countryCode_stateCode_city_idx" ON "Company"("countryCode", "stateCode", "city");

-- CreateIndex
CREATE INDEX "User_countryCode_stateCode_city_idx" ON "User"("countryCode", "stateCode", "city");
