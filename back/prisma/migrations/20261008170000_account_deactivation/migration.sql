ALTER TYPE "Status" RENAME TO "AccountStatus";
ALTER TYPE "AccountStatus" RENAME VALUE 'INACTIVE' TO 'DEACTIVATED';

UPDATE "Company"
SET "status" = CASE
  WHEN "approvalStatus" = 'APPROVED' AND "status" = 'DEACTIVATED' THEN 'DEACTIVATED'::"AccountStatus"
  ELSE 'ACTIVE'::"AccountStatus"
END;

ALTER TABLE "Company" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
