import { Response } from "express";

const defaultRefreshMs =
  Number(process.env.JWT_REFRESH_EXPIRES_MS) || 14 * 24 * 3600 * 1000;

const refreshCookieOptions = (ms: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: ms,
  path: "/",
});

const supportAccessCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 10 * 60 * 1000,
  path: "/api/support-only",
});

export function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(
    "refreshToken",
    refreshToken,
    refreshCookieOptions(defaultRefreshMs)
  );
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie("refreshToken", { path: "/" });
}

export function setSupportAccessCookie(res: Response, token: string) {
  res.cookie("supportAccessToken", token, supportAccessCookieOptions());
}

export function clearSupportAccessCookie(res: Response) {
  res.clearCookie("supportAccessToken", {
    path: "/api/support-only",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}
