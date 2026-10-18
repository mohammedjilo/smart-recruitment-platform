CREATE INDEX "Job_companyId_idx" ON "Job"("companyId");
CREATE INDEX "Job_status_idx" ON "Job"("status");
CREATE INDEX "Job_deadline_idx" ON "Job"("deadline");
CREATE INDEX "Job_companyId_status_createdAt_idx" ON "Job"("companyId", "status", "createdAt");

CREATE INDEX "Application_userId_createdAt_idx" ON "Application"("userId", "createdAt");
CREATE INDEX "Application_jobId_createdAt_idx" ON "Application"("jobId", "createdAt");
CREATE INDEX "Application_status_createdAt_idx" ON "Application"("status", "createdAt");

CREATE INDEX "Message_senderId_createdAt_idx" ON "Message"("senderId", "createdAt");
CREATE INDEX "Message_receiverId_createdAt_idx" ON "Message"("receiverId", "createdAt");
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
CREATE INDEX "Notification_companyId_createdAt_idx" ON "Notification"("companyId", "createdAt");
CREATE INDEX "SavedJob_userId_createdAt_idx" ON "SavedJob"("userId", "createdAt");