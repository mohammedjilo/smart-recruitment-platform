-- Remove only the existing support categories. Related tickets keep their rows
-- and categoryId is set to NULL by the existing foreign key action.
DELETE FROM "SupportCategory";

ALTER TABLE "SupportCategory"
DROP COLUMN "description";

ALTER TABLE "SupportCategory"
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "SupportCategory"
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

INSERT INTO "SupportCategory" ("name", "audience")
VALUES
  ('Jobs', 'COMPANY'),
  ('Applications', 'COMPANY'),
  ('Users / Candidates', 'COMPANY'),
  ('Company Account', 'COMPANY'),
  ('Technical Issue', 'COMPANY'),
  ('Other', 'COMPANY'),
  ('Applications', 'USER'),
  ('Job Search', 'USER'),
  ('Profile', 'USER'),
  ('Account & Security', 'USER'),
  ('Technical Issue', 'USER'),
  ('Other', 'USER');