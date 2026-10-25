ALTER TABLE "Notification"
ADD COLUMN "companyRequestId" TEXT;

CREATE INDEX "Notification_companyRequestId_createdAt_idx"
ON "Notification"("companyRequestId", "createdAt");

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_companyRequestId_fkey"
FOREIGN KEY ("companyRequestId") REFERENCES "Company"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
