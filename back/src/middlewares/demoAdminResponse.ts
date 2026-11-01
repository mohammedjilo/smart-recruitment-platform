import type { NextFunction, Request, Response } from "express";

const isPlainObject = (
  value: object
): value is Record<string, unknown> => {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const isCvReferenceKey = (key: string) => {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (normalized === "resumetype") return false;

  return (
    normalized.includes("cv") ||
    normalized.includes("resume") ||
    /^(file|download|storage|asset|cloudinary).*(url|uri|id|path|key|ref|token|link|public)/.test(
      normalized
    )
  );
};

const isCvDownloadUrl = (value: string) =>
  /^https?:\/\//i.test(value) &&
  (/(?:^|\/)raw\/(?:upload|download|authenticated)(?:\/|[?#]|$)/i.test(value) ||
    /applications\/cvs\//i.test(value) ||
    /\.pdf(?:[?#]|$)/i.test(value));

export const redactDemoAdminCvReferences = (value: unknown): unknown => {
  if (typeof value === "string") {
    return isCvDownloadUrl(value) ? undefined : value;
  }
  if (Array.isArray(value)) {
    return value.map(redactDemoAdminCvReferences);
  }
  if (!value || typeof value !== "object" || !isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !isCvReferenceKey(key))
      .flatMap(([key, child]) => {
        const redacted = redactDemoAdminCvReferences(child);
        return redacted === undefined ? [] : [[key, redacted]];
      })
  );
};

export const redactDemoAdminResponse = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.isDemoAdmin) return next();

  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) =>
    originalJson(redactDemoAdminCvReferences(body))) as Response["json"];
  return next();
};
