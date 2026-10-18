import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { verifyAccessToken } from "../utils/tokens.js";
import { AppError } from "../utils/appError.js";
import { clearRefreshCookie } from "../utils/cookies.js";

/**
 * Shared authentication boundary. It verifies the access token, reloads the
 * account state from the database, and places only typed identity context on
 * the request; role and approval requirements are separate middleware.
 */

type AccessPayload = JwtPayload & {
  id?: string;
  sub?: string;
  role?: "user" | "company";
};

const getToken = (req: Request) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) return undefined;
  const token = authorization.slice("Bearer ".length).trim();
  return token || undefined;
};

const loadAccount = async (payload: AccessPayload) => {
  const accountId = payload.id ?? payload.sub;
  if (!accountId || !payload.role) {
    throw new AppError("Invalid access token", 401, "UNAUTHORIZED");
  }

  if (payload.role === "company") {
    const company = await prisma.company.findUnique({
      where: { id: accountId },
      select: { id: true, status: true, approvalStatus: true },
    });
    if (!company) {
      throw new AppError("Company account not found", 403, "FORBIDDEN");
    }
    if (company.status === "DEACTIVATED") {
      throw new AppError(
        "Your company account has been deactivated.",
        403,
        "ACCOUNT_DEACTIVATED"
      );
    }
    return { type: "company" as const, account: company };
  }

  const user = await prisma.user.findUnique({
    where: { id: accountId },
    select: { id: true, role: true, accountStatus: true },
  });
  if (!user) {
    throw new AppError("User account not found", 403, "FORBIDDEN");
  }
  if (user.accountStatus === "DEACTIVATED") {
    throw new AppError(
      "Your user account has been deactivated.",
      403,
      "ACCOUNT_DEACTIVATED"
    );
  }
  return { type: "user" as const, account: user };
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = getToken(req);
  if (!token) {
    return next(new AppError("No authorization token", 401, "UNAUTHORIZED"));
  }

  let payload: AccessPayload;
  try {
    payload = verifyAccessToken(token) as AccessPayload;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Token expired", 401, "UNAUTHORIZED"));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Invalid token", 401, "UNAUTHORIZED"));
    }
    return next(error);
  }

  if (
    (payload as AccessPayload & { scope?: string }).scope === "support_only" ||
    payload.aud === "srb-support-only" ||
    (Array.isArray(payload.aud) && payload.aud.includes("srb-support-only"))
  ) {
    return next(new AppError("Invalid access token", 401, "UNAUTHORIZED"));
  }

  try {
    const account = await loadAccount(payload);
    if (account.type === "company") req.company = account.account;
    else req.user = account.account;
    return next();
  } catch (error: unknown) {
    if (error instanceof AppError && error.code === "ACCOUNT_DEACTIVATED") {
      clearRefreshCookie(res);
    }
    return next(error);
  }
};

export const authMiddleware = authenticate;

export const requireUser = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user)
    return next(new AppError("User access required", 403, "FORBIDDEN"));
  return next();
};

export const requireCompany = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.company)
    return next(new AppError("Company access required", 403, "FORBIDDEN"));
  return next();
};

export const requireApprovedCompany = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.company)
    return next(new AppError("Company access required", 403, "FORBIDDEN"));
  if (req.company.approvalStatus !== "APPROVED") {
    return next(
      new AppError("Approved company access required", 403, "FORBIDDEN")
    );
  }
  return next();
};

export const requireApprovedCompanyIfCompany = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.company) return next();
  return requireApprovedCompany(req, res, next);
};

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return next(new AppError("Admin access required", 403, "FORBIDDEN"));
  }
  return next();
};

export const onlyAdminMiddleware = [authenticate, requireUser, requireAdmin];
