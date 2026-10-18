ALTER TABLE "Application" ADD COLUMN "questionSnapshot" JSONB;

ALTER TABLE "ApplicationAnswer" DROP CONSTRAINT "ApplicationAnswer_questionId_fkey";
ALTER TABLE "ApplicationAnswer"
	ADD CONSTRAINT "ApplicationAnswer_questionId_fkey"
	FOREIGN KEY ("questionId") REFERENCES "ApplicationQuestion"("id")
	ON DELETE RESTRICT ON UPDATE CASCADE;