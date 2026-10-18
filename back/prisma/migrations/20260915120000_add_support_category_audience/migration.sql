-- CreateEnum
CREATE TYPE "SupportCategoryAudience" AS ENUM ('USER', 'COMPANY');

-- Add column with a temporary default so existing rows can be migrated safely
ALTER TABLE "SupportCategory"
ADD COLUMN "audience" "SupportCategoryAudience" NOT NULL DEFAULT 'USER';

-- Migrate existing categories to the correct audience
UPDATE "SupportCategory"
SET "audience" = 'COMPANY'
WHERE "name" IN (
  'Jobs',
  'Applications',
  'Users / Candidates',
  'Company Account',
  'Technical Issue',
  'Other'
);

UPDATE "SupportCategory"
SET "audience" = 'USER'
WHERE "name" IN (
  'Applications',
  'Job Search',
  'Profile',
  'Account & Security',
  'Technical Issue',
  'Other'
);

-- Drop the old unique index and build the correct composite index
DROP INDEX IF EXISTS "SupportCategory_name_key";
CREATE UNIQUE INDEX "SupportCategory_name_audience_key"
ON "SupportCategory"("name", "audience");

-- Keep a seed of the expected categories, making the system idempotent
INSERT INTO "SupportCategory" ("id", "name", "audience", "description", "active", "createdAt", "updatedAt")
VALUES
  ('support-category-company-jobs', 'Jobs', 'COMPANY', 'Create, manage and edit company job postings.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-company-applications', 'Applications', 'COMPANY', 'Review and manage applications from candidates.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-company-users', 'Users / Candidates', 'COMPANY', 'Search and manage candidates and user profiles.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-company-account', 'Company Account', 'COMPANY', 'Manage company profile, settings, and account details.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-company-technical', 'Technical Issue', 'COMPANY', 'Report bugs or technical issues affecting your company account.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-company-other', 'Other', 'COMPANY', 'General company support and inquiries.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-user-applications', 'Applications', 'USER', 'Track your applications and statuses.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-user-job-search', 'Job Search', 'USER', 'Search for roles and manage your job-search workflow.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-user-profile', 'Profile', 'USER', 'Update your profile, education, skills, and experience.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-user-account-security', 'Account & Security', 'USER', 'Manage your account settings and security.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-user-technical', 'Technical Issue', 'USER', 'Report technical issues or bugs while using the platform.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-user-other', 'Other', 'USER', 'General questions and other user support needs.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name", "audience") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "active" = EXCLUDED."active",
  "updatedAt" = CURRENT_TIMESTAMP;