INSERT INTO "SupportCategory" ("id", "name", "description", "active", "createdAt", "updatedAt")
VALUES
  ('support-category-jobs', 'Jobs', 'Create, manage and edit job postings.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-applications', 'Applications', 'View and manage applications.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-users-candidates', 'Users / Candidates', 'Search and manage candidates.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-company-account', 'Company Account', 'Manage company profile and settings.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-job-search', 'Job Search', 'Search and apply for jobs.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-profile', 'Profile', 'Update profile, education, skills, and experience.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-account-security', 'Account & Security', 'Manage password, email, and account settings.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-technical-issue', 'Technical Issue', 'Report bugs or technical problems.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('support-category-other', 'Other', 'General inquiries and other support topics.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "active" = EXCLUDED."active",
  "updatedAt" = CURRENT_TIMESTAMP;
