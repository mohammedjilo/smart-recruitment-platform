ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_exactly_one_recipient_check"
CHECK ((CASE WHEN "userId" IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN "companyId" IS NOT NULL THEN 1 ELSE 0 END) = 1);
