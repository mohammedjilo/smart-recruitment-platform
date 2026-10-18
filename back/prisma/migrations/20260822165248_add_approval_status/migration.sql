-- CreateEnum
CREATE TYPE "CompanyApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "approvalStatus" "CompanyApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'INACTIVE';
