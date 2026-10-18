import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import "dotenv/config";
import { writeStructuredLog } from "./structuredLogger.js";

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "14d";
export const SUPPORT_ONLY_TOKEN_SCOPE = "support_only" as const;
export const SUPPORT_ONLY_TOKEN_AUDIENCE = "srb-support-only" as const;
export const SUPPORT_ONLY_TOKEN_ISSUER = "srb-api" as const;

function getSecret(envName: string) {
  const v = process.env[envName];
  if (!v) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `${envName} is not set. Set it in your environment for production.`
      );
    }
    writeStructuredLog("warn", "auth.development_secret_fallback", {
      environmentVariable: envName,
    });
    return "dev-secret";
  }
  return v;
}

export function signAccessToken(payload: object) {
  const secret: Secret = getSecret("JWT_SECRET");
  const opts: SignOptions = {
    expiresIn: ACCESS_EXPIRES as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secret, opts);
}

export function signRefreshToken(payload: object) {
  const secret: Secret = getSecret("JWT_REFRESH_SECRET");
  const opts: SignOptions = {
    expiresIn: REFRESH_EXPIRES as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secret, opts);
}

export function signSupportOnlyToken(
  accountId: string,
  accountType: "user" | "company"
) {
  const secret: Secret = getSecret("JWT_SECRET");
  return jwt.sign(
    {
      sub: accountId,
      accountType,
      scope: SUPPORT_ONLY_TOKEN_SCOPE,
    },
    secret,
    {
      expiresIn: "10m",
      audience: SUPPORT_ONLY_TOKEN_AUDIENCE,
      issuer: SUPPORT_ONLY_TOKEN_ISSUER,
    }
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, getSecret("JWT_SECRET")) as JwtPayload;
}

export function verifySupportOnlyToken(token: string) {
  return jwt.verify(token, getSecret("JWT_SECRET"), {
    audience: SUPPORT_ONLY_TOKEN_AUDIENCE,
    issuer: SUPPORT_ONLY_TOKEN_ISSUER,
  }) as JwtPayload & {
    sub: string;
    accountType: "user" | "company";
    scope: typeof SUPPORT_ONLY_TOKEN_SCOPE;
  };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, getSecret("JWT_REFRESH_SECRET")) as JwtPayload;
}
