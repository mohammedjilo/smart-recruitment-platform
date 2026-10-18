/*
  Warnings:

  - You are about to drop the column `isCompleted` on the `ProfessionalProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProfessionalProfile" DROP COLUMN "isCompleted",
ALTER COLUMN "jobTitle" DROP NOT NULL,
ALTER COLUMN "yearsOfExperience" DROP NOT NULL;
