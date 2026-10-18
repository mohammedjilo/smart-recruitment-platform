/*
  Warnings:

  - You are about to drop the column `legacyPublicAuthorType` on the `SupportMessage` table. All the data in the column will be lost.
  - You are about to drop the column `legacyRequesterEmailDeliveryStatus` on the `SupportMessage` table. All the data in the column will be lost.
  - You are about to drop the column `legacyPublicIssue` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `legacyPublicSource` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `legacyRequesterEmail` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `legacyRequesterEmailVerifiedAt` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `legacyRequesterIdentityStatus` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `legacyRequesterTypeClaim` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the `ArchivedPublicSupportIntake` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArchivedSupportGuestAccessLink` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArchivedSupportGuestSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ArchivedPublicSupportIntake" DROP CONSTRAINT "ArchivedPublicSupportIntake_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "ArchivedSupportGuestAccessLink" DROP CONSTRAINT "ArchivedSupportGuestAccessLink_intakeId_fkey";

-- DropForeignKey
ALTER TABLE "ArchivedSupportGuestAccessLink" DROP CONSTRAINT "ArchivedSupportGuestAccessLink_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "ArchivedSupportGuestSession" DROP CONSTRAINT "ArchivedSupportGuestSession_ticketId_fkey";

-- DropIndex
DROP INDEX "ArchivedSupportTicket_requesterEmail_createdAt_idx";

-- DropIndex
DROP INDEX "ArchivedSupportTicket_source_createdAt_idx";

-- AlterTable
ALTER TABLE "SupportMessage" DROP COLUMN "legacyPublicAuthorType",
DROP COLUMN "legacyRequesterEmailDeliveryStatus";

-- AlterTable
ALTER TABLE "SupportTicket" DROP COLUMN "legacyPublicIssue",
DROP COLUMN "legacyPublicSource",
DROP COLUMN "legacyRequesterEmail",
DROP COLUMN "legacyRequesterEmailVerifiedAt",
DROP COLUMN "legacyRequesterIdentityStatus",
DROP COLUMN "legacyRequesterTypeClaim";

-- DropTable
DROP TABLE "ArchivedPublicSupportIntake";

-- DropTable
DROP TABLE "ArchivedSupportGuestAccessLink";

-- DropTable
DROP TABLE "ArchivedSupportGuestSession";

-- DropEnum
DROP TYPE "ArchivedPublicSupportDeliveryStatus";

-- DropEnum
DROP TYPE "ArchivedPublicSupportIssue";

-- DropEnum
DROP TYPE "ArchivedSupportGuestLinkPurpose";

-- DropEnum
DROP TYPE "ArchivedSupportMessageAuthorType";

-- DropEnum
DROP TYPE "ArchivedSupportRequesterIdentityStatus";

-- DropEnum
DROP TYPE "ArchivedSupportRequesterType";

-- DropEnum
DROP TYPE "ArchivedSupportTicketSource";
