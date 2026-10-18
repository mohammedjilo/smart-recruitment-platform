CREATE TYPE "SupportTicketSource" AS ENUM ('AUTHENTICATED', 'PUBLIC');
CREATE TYPE "SupportRequesterType" AS ENUM ('USER', 'COMPANY', 'UNKNOWN');
CREATE TYPE "SupportRequesterIdentityStatus" AS ENUM (
  'UNLINKED',
  'MATCHED',
  'AMBIGUOUS',
  'CLAIM_MISMATCH'
);
CREATE TYPE "PublicSupportIssue" AS ENUM (
  'ACCOUNT_DEACTIVATED',
  'CANNOT_LOGIN',
  'REGISTRATION_PROBLEM',
  'OTHER'
);
CREATE TYPE "PublicSupportDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');
CREATE TYPE "SupportGuestLinkPurpose" AS ENUM ('VERIFY_REQUEST', 'CONVERSATION_ACCESS');
CREATE TYPE "SupportMessageAuthorType" AS ENUM ('USER', 'COMPANY', 'ADMIN', 'PUBLIC_REQUESTER');

ALTER TABLE "SupportTicket"
  ADD COLUMN "source" "SupportTicketSource" NOT NULL DEFAULT 'AUTHENTICATED',
  ADD COLUMN "requesterEmail" TEXT,
  ADD COLUMN "requesterEmailVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "requesterTypeClaim" "SupportRequesterType",
  ADD COLUMN "requesterIdentityStatus" "SupportRequesterIdentityStatus",
  ADD COLUMN "publicIssue" "PublicSupportIssue";

ALTER TABLE "SupportMessage"
  ADD COLUMN "authorType" "SupportMessageAuthorType",
  ADD COLUMN "requesterEmailDeliveryStatus" "PublicSupportDeliveryStatus";

CREATE TABLE "PublicSupportIntake" (
  "id" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "requesterEmail" TEXT NOT NULL,
  "claimedRequesterType" "SupportRequesterType" NOT NULL DEFAULT 'UNKNOWN',
  "issue" "PublicSupportIssue" NOT NULL,
  "subject" TEXT NOT NULL,
  "initialMessage" TEXT NOT NULL,
  "categoryId" TEXT,
  "deliveryStatus" "PublicSupportDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "verificationSentAt" TIMESTAMP(3),
  "verifiedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "ticketId" TEXT,

  CONSTRAINT "PublicSupportIntake_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportGuestAccessLink" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "purpose" "SupportGuestLinkPurpose" NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ticketId" TEXT,
  "intakeId" TEXT,

  CONSTRAINT "SupportGuestAccessLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportGuestSession" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ticketId" TEXT NOT NULL,

  CONSTRAINT "SupportGuestSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PublicSupportIntake_idempotencyKey_key"
  ON "PublicSupportIntake"("idempotencyKey");
CREATE UNIQUE INDEX "PublicSupportIntake_ticketId_key"
  ON "PublicSupportIntake"("ticketId");
CREATE INDEX "PublicSupportIntake_requesterEmail_createdAt_idx"
  ON "PublicSupportIntake"("requesterEmail", "createdAt");
CREATE INDEX "PublicSupportIntake_deliveryStatus_createdAt_idx"
  ON "PublicSupportIntake"("deliveryStatus", "createdAt");

CREATE UNIQUE INDEX "SupportGuestAccessLink_tokenHash_key"
  ON "SupportGuestAccessLink"("tokenHash");
CREATE INDEX "SupportGuestAccessLink_ticketId_purpose_expiresAt_idx"
  ON "SupportGuestAccessLink"("ticketId", "purpose", "expiresAt");
CREATE INDEX "SupportGuestAccessLink_intakeId_purpose_expiresAt_idx"
  ON "SupportGuestAccessLink"("intakeId", "purpose", "expiresAt");

CREATE UNIQUE INDEX "SupportGuestSession_tokenHash_key"
  ON "SupportGuestSession"("tokenHash");
CREATE INDEX "SupportGuestSession_ticketId_expiresAt_idx"
  ON "SupportGuestSession"("ticketId", "expiresAt");

CREATE INDEX "SupportTicket_source_createdAt_idx"
  ON "SupportTicket"("source", "createdAt");
CREATE INDEX "SupportTicket_requesterEmail_createdAt_idx"
  ON "SupportTicket"("requesterEmail", "createdAt");

ALTER TABLE "PublicSupportIntake"
  ADD CONSTRAINT "PublicSupportIntake_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SupportGuestAccessLink"
  ADD CONSTRAINT "SupportGuestAccessLink_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id")
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "SupportGuestAccessLink_intakeId_fkey"
  FOREIGN KEY ("intakeId") REFERENCES "PublicSupportIntake"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SupportGuestSession"
  ADD CONSTRAINT "SupportGuestSession_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
