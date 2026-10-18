-- AlterTable
ALTER TABLE "ApplicationQuestion" ADD COLUMN     "maxNumber" DOUBLE PRECISION,
ADD COLUMN     "maxSelection" INTEGER,
ADD COLUMN     "minNumber" DOUBLE PRECISION,
ADD COLUMN     "minSelection" INTEGER;
