DROP INDEX IF EXISTS "Application_userId_jobId_key";

CREATE UNIQUE INDEX "Application_active_userId_jobId_key"
ON "Application"("userId", "jobId")
WHERE "status" <> 'WITHDRAWN';

ALTER TABLE "Job"
ALTER COLUMN "deadline" TYPE DATE
USING "deadline"::DATE;