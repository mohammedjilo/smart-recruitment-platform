/*
  Warnings:

  - Added the required column `resumeType` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ResumeType" AS ENUM ('PROFILE', 'UPLOAD');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "cvId" TEXT,
ADD COLUMN     "cvUrl" TEXT,
ADD COLUMN     "profileSnapshot" JSONB,
ADD COLUMN     "resumeType" "ResumeType" NOT NULL;
