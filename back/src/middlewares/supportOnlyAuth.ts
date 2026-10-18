import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { verifySupportOnlyToken } from "../utils/tokens.js";

const rejectSupportAccess = () =>
  new AppError(
    "Support-only access is invalid or expired. Verify your credentials again.",
    401,
    "UNAUTHORIZED"
  );

export const requireSupportOnlyAccess = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.headers.authorization) return next(rejectSupportAccess());

  const token = req.cookies?.supportAccessToken;
  if (typeof token !== "string" || token.length === 0) {
    return next(rejectSupportAccess());
  }

  let payload: ReturnType<typeof verifySupportOnlyToken>;
  try {
    payload = verifySupportOnlyToken(token);
  } catch (error: unknown) {
    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError
    ) {
      return next(rejectSupportAccess());
    }
    return next(error);
  }

  if (
    payload.scope !== "support_only" ||
    !payload.sub ||
    (payload.accountType !== "user" && payload.accountType !== "company")
  ) {
    return next(rejectSupportAccess());
  }

  if (payload.accountType === "user") {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, accountStatus: true },
    });
    if (!user || user.accountStatus !== "DEACTIVATED") {
      return next(rejectSupportAccess());
    }
    req.user = { id: user.id, role: "USER", accountStatus: user.accountStatus };
  } else {
    const company = await prisma.company.findUnique({
      where: { id: payload.sub },
      select: { id: true, status: true, approvalStatus: true },
    });
    if (!company || company.status !== "DEACTIVATED") {
      return next(rejectSupportAccess());
    }
    req.company = company;
  }

  req.supportOnlyAccountType = payload.accountType;
  return next();
};
