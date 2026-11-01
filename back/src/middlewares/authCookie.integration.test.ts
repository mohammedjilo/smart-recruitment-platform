import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "../index.js";
import { prisma } from "../config/db.js";
import { hashPassword } from "../services/auth.service.js";
import {
  clearRefreshCookie,
  setRefreshCookie,
} from "../utils/cookies.js";

const originalNodeEnv = process.env.NODE_ENV;
const originalFrontendUrl = process.env.FRONTEND_URL;
const originalJwtSecret = process.env.JWT_SECRET;
const originalRefreshSecret = process.env.JWT_REFRESH_SECRET;

process.env.NODE_ENV = "production";
process.env.FRONTEND_URL = "https://frontend.example.test";
process.env.JWT_SECRET = "auth-cookie-integration-access-secret";
process.env.JWT_REFRESH_SECRET = "auth-cookie-integration-refresh-secret";

const trustedOrigin = "https://frontend.example.test";
const user = {
  id: "auth-cookie-test-user",
  email: "auth-cookie@example.test",
  profilePicUrl: null,
  firstName: "Auth",
  lastName: "Cookie",
  password: hashPassword("valid-test-password"),
  role: "USER",
  accountStatus: "ACTIVE",
};

const app = createApp();
const originalFindUnique = Object.getOwnPropertyDescriptor(
  prisma.user,
  "findUnique"
);
let server: ReturnType<typeof app.listen>;
let baseUrl: string;
let refreshCookie: string;

before(async () => {
  Object.defineProperty(prisma.user, "findUnique", {
    configurable: true,
    writable: true,
    value: async ({ where }: { where: { email?: string; id?: string } }) =>
      where.email === user.email || where.id === user.id ? user : null,
  });

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Could not determine auth test server address");
      }
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  if (originalFindUnique) {
    Object.defineProperty(prisma.user, "findUnique", originalFindUnique);
  } else {
    delete (prisma.user as { findUnique?: unknown }).findUnique;
  }
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
  if (originalFrontendUrl === undefined) delete process.env.FRONTEND_URL;
  else process.env.FRONTEND_URL = originalFrontendUrl;
  if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalJwtSecret;
  if (originalRefreshSecret === undefined)
    delete process.env.JWT_REFRESH_SECRET;
  else process.env.JWT_REFRESH_SECRET = originalRefreshSecret;
});

test("production login issues a secure cross-site refresh cookie", async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      Origin: trustedOrigin,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role: "user",
      email: user.email,
      password: "valid-test-password",
    }),
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), trustedOrigin);
  assert.equal(response.headers.get("access-control-allow-credentials"), "true");

  const setCookie = response.headers.get("set-cookie");
  assert.ok(setCookie);
  assert.match(setCookie, /(?:^|;\s*)Path=\//i);
  assert.match(setCookie, /(?:^|;\s*)HttpOnly/i);
  assert.match(setCookie, /(?:^|;\s*)Secure/i);
  assert.match(setCookie, /(?:^|;\s*)SameSite=None/i);
  assert.doesNotMatch(setCookie, /(?:^|;\s*)Domain=/i);
  refreshCookie = setCookie.split(";", 1)[0];
});

test("trusted and origin-less clients can refresh without rotating the cookie", async () => {
  for (const headers of [
    { Origin: trustedOrigin, Cookie: refreshCookie },
    { Cookie: refreshCookie },
  ]) {
    const response = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers,
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-credentials"), "true");
    assert.equal(response.headers.get("set-cookie"), null);
    const body = (await response.json()) as {
      success: boolean;
      data: { token: string };
    };
    assert.equal(body.success, true);
    assert.equal(typeof body.data.token, "string");
  }
});

test("untrusted origins cannot refresh or log out", async () => {
  const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
    method: "POST",
    headers: {
      Origin: "https://untrusted.example.test",
      Cookie: refreshCookie,
    },
  });
  assert.equal(refreshResponse.status, 403);

  const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: {
      Origin: "https://untrusted.example.test",
      Cookie: refreshCookie,
    },
  });
  assert.equal(logoutResponse.status, 403);
  assert.equal(logoutResponse.headers.get("set-cookie"), null);

  const supportLogoutResponse = await fetch(
    `${baseUrl}/api/auth/support-access/logout`,
    {
      method: "POST",
      headers: { Origin: "https://untrusted.example.test" },
    }
  );
  assert.equal(supportLogoutResponse.status, 403);
});

test("logout clears the production refresh cookie using matching attributes", async () => {
  const response = await fetch(`${baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: refreshCookie },
  });

  assert.equal(response.status, 200);
  const setCookie = response.headers.get("set-cookie");
  assert.ok(setCookie);
  assert.match(setCookie, /^refreshToken=;/);
  assert.match(setCookie, /(?:^|;\s*)Path=\//i);
  assert.match(setCookie, /(?:^|;\s*)HttpOnly/i);
  assert.match(setCookie, /(?:^|;\s*)Secure/i);
  assert.match(setCookie, /(?:^|;\s*)SameSite=None/i);
  assert.doesNotMatch(setCookie, /(?:^|;\s*)Domain=/i);
});

test("development refresh cookies remain same-site and non-secure", () => {
  const originalEnvironment = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  let issuedOptions: Record<string, unknown> | undefined;
  let clearedOptions: Record<string, unknown> | undefined;
  const response = {
    cookie: (_name: string, _value: string, options: Record<string, unknown>) => {
      issuedOptions = options;
    },
    clearCookie: (_name: string, options: Record<string, unknown>) => {
      clearedOptions = options;
    },
  };

  try {
    setRefreshCookie(response as never, "test-refresh-cookie");
    clearRefreshCookie(response as never);
  } finally {
    if (originalEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalEnvironment;
  }

  assert.equal(issuedOptions?.sameSite, "lax");
  assert.equal(issuedOptions?.secure, false);
  assert.equal(issuedOptions?.httpOnly, true);
  assert.equal(issuedOptions?.path, "/");
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(clearedOptions ?? {}).filter(([key]) => key !== "maxAge")
    ),
    Object.fromEntries(
      Object.entries(issuedOptions ?? {}).filter(([key]) => key !== "maxAge")
    )
  );
});
