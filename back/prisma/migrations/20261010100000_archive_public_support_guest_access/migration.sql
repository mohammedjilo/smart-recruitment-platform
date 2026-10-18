BEGIN;

-- Revoke outstanding access credentials but retain every intake, ticket, and message row.
UPDATE "SupportGuestAccessLink"
SET "revokedAt" = COALESCE("revokedAt", CURRENT_TIMESTAMP);

UPDATE "SupportGuestSession"
SET "revokedAt" = COALESCE("revokedAt", CURRENT_TIMESTAMP);

-- Keep the abandoned feature data and additive Support columns as archived data.
ALTER TABLE "SupportTicket" RENAME COLUMN "source" TO "legacyPublicSource";
ALTER TABLE "SupportTicket" RENAME COLUMN "requesterEmail" TO "legacyRequesterEmail";
ALTER TABLE "SupportTicket" RENAME COLUMN "requesterEmailVerifiedAt" TO "legacyRequesterEmailVerifiedAt";
ALTER TABLE "SupportTicket" RENAME COLUMN "requesterTypeClaim" TO "legacyRequesterTypeClaim";
ALTER TABLE "SupportTicket" RENAME COLUMN "requesterIdentityStatus" TO "legacyRequesterIdentityStatus";
ALTER TABLE "SupportTicket" RENAME COLUMN "publicIssue" TO "legacyPublicIssue";
ALTER TABLE "SupportMessage" RENAME COLUMN "authorType" TO "legacyPublicAuthorType";
ALTER TABLE "SupportMessage" RENAME COLUMN "requesterEmailDeliveryStatus" TO "legacyRequesterEmailDeliveryStatus";

ALTER TABLE "PublicSupportIntake" RENAME TO "ArchivedPublicSupportIntake";
ALTER TABLE "SupportGuestAccessLink" RENAME TO "ArchivedSupportGuestAccessLink";
ALTER TABLE "SupportGuestSession" RENAME TO "ArchivedSupportGuestSession";

ALTER TYPE "SupportTicketSource" RENAME TO "ArchivedSupportTicketSource";
ALTER TYPE "SupportRequesterType" RENAME TO "ArchivedSupportRequesterType";
ALTER TYPE "SupportRequesterIdentityStatus" RENAME TO "ArchivedSupportRequesterIdentityStatus";
ALTER TYPE "PublicSupportIssue" RENAME TO "ArchivedPublicSupportIssue";
ALTER TYPE "PublicSupportDeliveryStatus" RENAME TO "ArchivedPublicSupportDeliveryStatus";
ALTER TYPE "SupportGuestLinkPurpose" RENAME TO "ArchivedSupportGuestLinkPurpose";
ALTER TYPE "SupportMessageAuthorType" RENAME TO "ArchivedSupportMessageAuthorType";

ALTER INDEX "SupportTicket_source_createdAt_idx" RENAME TO "ArchivedSupportTicket_source_createdAt_idx";
ALTER INDEX "SupportTicket_requesterEmail_createdAt_idx" RENAME TO "ArchivedSupportTicket_requesterEmail_createdAt_idx";
ALTER INDEX "PublicSupportIntake_idempotencyKey_key" RENAME TO "ArchivedPublicSupportIntake_idempotencyKey_key";
ALTER INDEX "PublicSupportIntake_ticketId_key" RENAME TO "ArchivedPublicSupportIntake_ticketId_key";
ALTER INDEX "PublicSupportIntake_requesterEmail_createdAt_idx" RENAME TO "ArchivedPublicSupportIntake_requesterEmail_createdAt_idx";
ALTER INDEX "PublicSupportIntake_deliveryStatus_createdAt_idx" RENAME TO "ArchivedPublicSupportIntake_deliveryStatus_createdAt_idx";
ALTER INDEX "SupportGuestAccessLink_tokenHash_key" RENAME TO "ArchivedSupportGuestAccessLink_tokenHash_key";
ALTER INDEX "SupportGuestAccessLink_ticketId_purpose_expiresAt_idx" RENAME TO "ArchivedSupportGuestAccessLink_ticketId_purpose_expiresAt_idx";
ALTER INDEX "SupportGuestAccessLink_intakeId_purpose_expiresAt_idx" RENAME TO "ArchivedSupportGuestAccessLink_intakeId_purpose_expiresAt_idx";
ALTER INDEX "SupportGuestSession_tokenHash_key" RENAME TO "ArchivedSupportGuestSession_tokenHash_key";
ALTER INDEX "SupportGuestSession_ticketId_expiresAt_idx" RENAME TO "ArchivedSupportGuestSession_ticketId_expiresAt_idx";

ALTER TABLE "ArchivedPublicSupportIntake" RENAME CONSTRAINT "PublicSupportIntake_pkey" TO "ArchivedPublicSupportIntake_pkey";
ALTER TABLE "ArchivedPublicSupportIntake" RENAME CONSTRAINT "PublicSupportIntake_ticketId_fkey" TO "ArchivedPublicSupportIntake_ticketId_fkey";
ALTER TABLE "ArchivedSupportGuestAccessLink" RENAME CONSTRAINT "SupportGuestAccessLink_pkey" TO "ArchivedSupportGuestAccessLink_pkey";
ALTER TABLE "ArchivedSupportGuestAccessLink" RENAME CONSTRAINT "SupportGuestAccessLink_ticketId_fkey" TO "ArchivedSupportGuestAccessLink_ticketId_fkey";
ALTER TABLE "ArchivedSupportGuestAccessLink" RENAME CONSTRAINT "SupportGuestAccessLink_intakeId_fkey" TO "ArchivedSupportGuestAccessLink_intakeId_fkey";
ALTER TABLE "ArchivedSupportGuestSession" RENAME CONSTRAINT "SupportGuestSession_pkey" TO "ArchivedSupportGuestSession_pkey";
ALTER TABLE "ArchivedSupportGuestSession" RENAME CONSTRAINT "SupportGuestSession_ticketId_fkey" TO "ArchivedSupportGuestSession_ticketId_fkey";

COMMIT;
