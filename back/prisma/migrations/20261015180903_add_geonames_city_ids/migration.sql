-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "cityGeonameId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cityGeonameId" INTEGER;

-- CreateIndex
CREATE INDEX "Company_countryCode_cityGeonameId_idx" ON "Company"("countryCode", "cityGeonameId");

-- CreateIndex
CREATE INDEX "User_countryCode_cityGeonameId_idx" ON "User"("countryCode", "cityGeonameId");
