import { expireOpenJobsPastDeadline } from "../services/job.service.js";
import {
  getErrorDiagnostics,
  writeStructuredLog,
} from "../utils/structuredLogger.js";

const runExpiration = async () => {
  try {
    const expiredCount = await expireOpenJobsPastDeadline();
    if (expiredCount > 0) {
      writeStructuredLog("info", "jobs.expiration.completed", {
        expiredCount,
      });
    }
  } catch (error) {
    writeStructuredLog("error", "jobs.expiration.failed", {
      source: "database",
      ...getErrorDiagnostics(error),
    });
  }
};

const scheduleNextUtcMidnight = () => {
  const now = new Date();
  const nextMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  const timer = setTimeout(() => {
    void runExpiration().finally(scheduleNextUtcMidnight);
  }, nextMidnight.getTime() - now.getTime());
  timer.unref();
};

export const startJobExpirationScheduler = () => {
  void runExpiration();
  scheduleNextUtcMidnight();
};
