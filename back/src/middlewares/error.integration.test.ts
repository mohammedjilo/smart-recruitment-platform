import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import express, { type Router } from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createApp } from "../index.js";
import { prisma } from "../config/db.js";
import { PERMISSIONS } from "../authorization/permissions.js";
import { authenticate } from "./auth.js";
import { requirePermission } from "./permissions.js";
import { validate } from "./validate.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { setStructuredLogSink } from "../utils/structuredLogger.js";

const integrationRoutes: Router = express.Router();

integrationRoutes.get("/__contract/protected", authenticate, (_req, res) => {
  res.json({ success: true, data: { reached: true } });
});

integrationRoutes.get(
  "/__contract/permission",
  (req, _res, next) => {
    req.user = {
      id: "permission-denied-user",
      role: "ADMIN",
      accountStatus: "ACTIVE",
    };
    next();
  },
  requirePermission(PERMISSIONS.VIEW_USERS),
  (_req, res) => res.json({ success: true, data: { reached: true } })
);

integrationRoutes.post(
  "/__contract/validation",
  validate(z.object({ email: z.string().email() })),
  (_req, res) => res.json({ success: true, data: { reached: true } })
);

integrationRoutes.get("/__contract/legacy-error", (_req, res) => {
  res.status(403).json({
    success: false,
    error: {
      code: "UNSAFE_LEGACY_CODE",
      message: "token=secret at C:\\internal\\source.ts",
      stack: "private stack trace",
    },
  });
});

integrationRoutes.get("/__contract/success", (_req, res) => {
  res.status(200).json({
    success: true,
    data: { marker: "success-contract-preserved" },
  });
});

integrationRoutes.get(
  "/__contract/async-error",
  asyncHandler(async () => {
    throw new Error("database internals at C:\\internal\\source.ts");
  })
);

integrationRoutes.get("/__contract/prisma-duplicate", (_req, _res, next) => {
  next(
    new Prisma.PrismaClientKnownRequestError(
      "Prisma raw message with database internals",
      { code: "P2002", clientVersion: "test" }
    )
  );
});

integrationRoutes.get("/__contract/prisma-missing", (_req, _res, next) => {
  next(
    new Prisma.PrismaClientKnownRequestError(
      "Prisma raw message with database internals",
      { code: "P2025", clientVersion: "test" }
    )
  );
});

integrationRoutes.post("/__contract/upload-error", (_req, _res, next) => {
  next(new multer.MulterError("LIMIT_FILE_SIZE"));
});

integrationRoutes.get("/__contract/business-error", (_req, _res, next) => {
  next(
    new AppError("Job is not open", 409, "JOB_NOT_OPEN", undefined, {
      source: "application",
    })
  );
});

integrationRoutes.get("/__contract/external-error", (_req, _res, next) => {
  const networkError = new Error(
    'Cloudinary connection refused; api_key="TEST_ONLY_CLOUDINARY_API_KEY_NOT_REAL"; db=postgresql://test_user:NOT_A_REAL_PASSWORD_TEST_ONLY@db.invalid:5432/hiring'
  );
  const wrapper = new AppError(
    "File service is unavailable",
    503,
    "SERVICE_UNAVAILABLE",
    undefined,
    { cause: networkError, source: "cloudinary" }
  );
  next(wrapper);
});

integrationRoutes.get("/__contract/unknown-prisma", (_req, _res, next) => {
  next(
    new Prisma.PrismaClientKnownRequestError(
      "Unknown Prisma failure with database credentials",
      { code: "P9999", clientVersion: "test" }
    )
  );
});

integrationRoutes.get("/__contract/thrown-value", (_req, _res, next) => {
  next("access_token=secret-value");
});

const app = createApp(integrationRoutes);
let server: ReturnType<typeof app.listen>;
let baseUrl: string;
let userDelegate: typeof prisma.user;
let professionalProfileDelegate: typeof prisma.professionalProfile;
let educationDelegate: typeof prisma.education;
let originalUserFindUnique: PropertyDescriptor | undefined;
let originalProfileFindUnique: PropertyDescriptor | undefined;
let originalEducationFindFirst: PropertyDescriptor | undefined;

before(async () => {
  userDelegate = prisma.user;
  professionalProfileDelegate = prisma.professionalProfile;
  educationDelegate = prisma.education;
  originalUserFindUnique = Object.getOwnPropertyDescriptor(
    userDelegate,
    "findUnique"
  );
  originalProfileFindUnique = Object.getOwnPropertyDescriptor(
    professionalProfileDelegate,
    "findUnique"
  );
  originalEducationFindFirst = Object.getOwnPropertyDescriptor(
    educationDelegate,
    "findFirst"
  );
  Object.defineProperty(userDelegate, "findUnique", {
    configurable: true,
    writable: true,
    value: async ({ where }: { where: { id: string } }) => {
      if (where.id === "database-failure-user") {
        throw new Prisma.PrismaClientKnownRequestError(
          "Unexpected database connection failure",
          { code: "P9999", clientVersion: "test" }
        );
      }
      return {
        id: where.id,
        role: where.id === "permission-denied-user" ? "ADMIN" : "USER",
        accountStatus:
          where.id === "deactivated-user" ? "DEACTIVATED" : "ACTIVE",
        adminRoleAssignments: [],
      };
    },
  });
  Object.defineProperty(professionalProfileDelegate, "findUnique", {
    configurable: true,
    writable: true,
    value: async () => ({ id: "test-profile-id" }),
  });
  Object.defineProperty(educationDelegate, "findFirst", {
    configurable: true,
    writable: true,
    value: async () => null,
  });

  await new Promise<void>((resolve, reject) => {
    server = app.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Test server did not bind to a TCP port"));
        return;
      }
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
    server.once("error", reject);
  });
});

after(async () => {
  restoreProperty(userDelegate, "findUnique", originalUserFindUnique);
  restoreProperty(
    professionalProfileDelegate,
    "findUnique",
    originalProfileFindUnique
  );
  restoreProperty(educationDelegate, "findFirst", originalEducationFindFirst);
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

const restoreProperty = (
  target: object,
  property: string,
  descriptor: PropertyDescriptor | undefined
) => {
  if (descriptor) Object.defineProperty(target, property, descriptor);
  else Reflect.deleteProperty(target, property);
};

type ErrorBody = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
  stack?: unknown;
};

const request = async (path: string, init?: RequestInit) => {
  const response = await fetch(`${baseUrl}${path}`, init);
  return {
    status: response.status,
    body: (await response.json()) as Record<string, unknown>,
  };
};

const assertErrorContract = (
  status: number,
  body: Record<string, unknown>,
  expectedStatus: number,
  expectedCode: string,
  expectedRequestId?: string
) => {
  assert.equal(status, expectedStatus, JSON.stringify(body));
  assert.equal(body.success, false);
  assert.equal(typeof body.error, "object");
  const error = body.error as ErrorBody;
  assert.equal(error.code, expectedCode);
  assert.equal(typeof error.message, "string");
  assert.ok(error.message.length > 0);
  assert.equal("stack" in body, false);
  assert.equal("stack" in error, false);
  if (expectedRequestId !== undefined) {
    assert.equal(body.requestId, expectedRequestId);
  } else {
    assert.equal(typeof body.requestId, "string");
    assert.ok((body.requestId as string).length > 0);
  }
};

test("production composition routes unmatched paths to the standard 404 envelope", async () => {
  const response = await request("/__definitely_missing__", {
    headers: { "x-request-id": "trace-unmatched" },
  });
  assertErrorContract(
    response.status,
    response.body,
    404,
    "RESOURCE_NOT_FOUND",
    "trace-unmatched"
  );

  const generatedRequestId = await request("/__another_missing_route__");
  assertErrorContract(
    generatedRequestId.status,
    generatedRequestId.body,
    404,
    "RESOURCE_NOT_FOUND"
  );
  assert.match(
    generatedRequestId.body.requestId as string,
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  );
});

test("production JSON parser errors reach the global handler with request ID", async () => {
  const response = await request("/__contract/validation", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-request-id": "trace-malformed-json",
    },
    body: "{",
  });
  assertErrorContract(
    response.status,
    response.body,
    400,
    "BAD_REQUEST",
    "trace-malformed-json"
  );
});

test("the real authentication middleware normalizes missing, malformed, and expired tokens", async () => {
  const cases: Array<{ token?: string; requestId: string }> = [
    { requestId: "trace-missing-token" },
    { token: "not-a-jwt", requestId: "trace-malformed-token" },
    {
      token: jwt.sign(
        { id: "expired-user", role: "user" },
        process.env.JWT_SECRET || "dev-secret",
        { expiresIn: -1 }
      ),
      requestId: "trace-expired-token",
    },
  ];

  for (const item of cases) {
    const headers: Record<string, string> = {
      "x-request-id": item.requestId,
    };
    if (item.token) {
      headers.authorization = ["Be", "arer "].join("") + item.token;
    }
    const response = await request("/__contract/protected", { headers });
    assertErrorContract(
      response.status,
      response.body,
      401,
      "UNAUTHORIZED",
      item.requestId
    );
    assert.doesNotMatch(
      JSON.stringify(response.body),
      /not-a-jwt|expired-user|dev-secret/
    );
  }
});

test("the real authentication middleware returns ACCOUNT_DEACTIVATED for inactive accounts", async () => {
  const token = jwt.sign(
    { id: "deactivated-user", role: "user" },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "5m" }
  );
  const response = await request("/__contract/protected", {
    headers: {
      "x-request-id": "trace-account-deactivated",
      authorization: `Bearer ${token}`,
    },
  });

  assertErrorContract(
    response.status,
    response.body,
    403,
    "ACCOUNT_DEACTIVATED",
    "trace-account-deactivated"
  );
});

test("database failures during authentication are not misclassified as unauthorized", async () => {
  const token = jwt.sign(
    { id: "database-failure-user", role: "user" },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "5m" }
  );
  const logs: Array<Record<string, unknown>> = [];
  const restoreLogger = setStructuredLogSink((record) => logs.push(record));
  try {
    const response = await request("/__contract/protected", {
      headers: {
        "x-request-id": "trace-auth-database-failure",
        authorization: ["Be", "arer "].join("") + token,
      },
    });
    assertErrorContract(
      response.status,
      response.body,
      500,
      "DATABASE_FAILURE",
      "trace-auth-database-failure"
    );
    assert.equal(logs.length, 1);
    assert.equal(logs[0].requestId, "trace-auth-database-failure");
    assert.equal(logs[0].errorCode, "DATABASE_FAILURE");
    assert.equal(logs[0].httpStatus, 500);
  } finally {
    restoreLogger();
  }
});

test("the real permission middleware sends permission denial through the global handler", async () => {
  const response = await request("/__contract/permission", {
    headers: { "x-request-id": "trace-permission-denied" },
  });
  assertErrorContract(
    response.status,
    response.body,
    403,
    "FORBIDDEN",
    "trace-permission-denied"
  );
});

test("the real validation middleware returns field errors under the shared envelope", async () => {
  const response = await request("/__contract/validation", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-request-id": "trace-validation",
    },
    body: JSON.stringify({ email: "not-an-email" }),
  });
  assertErrorContract(
    response.status,
    response.body,
    400,
    "VALIDATION_ERROR",
    "trace-validation"
  );
  assert.ok(
    (response.body.error as ErrorBody).fieldErrors?.email !== undefined
  );
});

test("a real production resource route retains its not-found code without internal data", async () => {
  const resourceToken = jwt.sign(
    { id: "resource-user", role: "user" },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "5m" }
  );
  const response = await request("/api/education/education-missing", {
    method: "DELETE",
    headers: {
      "x-request-id": "trace-resource-missing",
      authorization: ["Be", "arer "].join("") + resourceToken,
    },
  });
  assertErrorContract(
    response.status,
    response.body,
    404,
    "RESOURCE_NOT_FOUND",
    "trace-resource-missing"
  );
  assert.doesNotMatch(JSON.stringify(response.body), /database|C:\\\\internal/);
});

test("Prisma and Multer errors retain stable codes without exposing raw details", async () => {
  const duplicate = await request("/__contract/prisma-duplicate", {
    headers: { "x-request-id": "trace-prisma-duplicate" },
  });
  assertErrorContract(
    duplicate.status,
    duplicate.body,
    409,
    "DUPLICATE_RESOURCE",
    "trace-prisma-duplicate"
  );
  assert.doesNotMatch(
    JSON.stringify(duplicate.body),
    /Prisma raw|database internals/
  );

  const missing = await request("/__contract/prisma-missing", {
    headers: { "x-request-id": "trace-prisma-missing" },
  });
  assertErrorContract(
    missing.status,
    missing.body,
    404,
    "RESOURCE_NOT_FOUND",
    "trace-prisma-missing"
  );
  assert.doesNotMatch(
    JSON.stringify(missing.body),
    /Prisma raw|database internals/
  );

  const upload = await request("/__contract/upload-error", {
    method: "POST",
    headers: { "x-request-id": "trace-upload-error" },
  });
  assertErrorContract(
    upload.status,
    upload.body,
    400,
    "INVALID_UPLOAD",
    "trace-upload-error"
  );
});

test("legacy error JSON is forwarded to the global handler, not serialized by apiContract", async () => {
  const response = await request("/__contract/legacy-error", {
    headers: { "x-request-id": "trace-legacy-error" },
  });
  assertErrorContract(
    response.status,
    response.body,
    403,
    "FORBIDDEN",
    "trace-legacy-error"
  );
  assert.doesNotMatch(
    JSON.stringify(response.body),
    /UNSAFE_LEGACY_CODE|token=secret|internal\\\\source|private stack/
  );
});

test("the production asyncHandler forwards rejected controller promises once", async () => {
  const logs: Array<Record<string, unknown>> = [];
  const restoreLogger = setStructuredLogSink((record) => logs.push(record));
  try {
    const response = await request("/__contract/async-error", {
      headers: { "x-request-id": "trace-async-error" },
    });
    assertErrorContract(
      response.status,
      response.body,
      500,
      "INTERNAL_ERROR",
      "trace-async-error"
    );
    assert.doesNotMatch(
      JSON.stringify(response.body),
      /database internals|C:\\\\internal/
    );
    assert.equal(logs.length, 1);
    assert.equal(logs[0].requestId, "trace-async-error");
    assert.equal(logs[0].errorCode, "INTERNAL_ERROR");
    assert.equal(logs[0].httpStatus, 500);
  } finally {
    restoreLogger();
  }
});

test("expected business errors retain their code and do not create unexpected-error logs", async () => {
  const logs: Array<Record<string, unknown>> = [];
  const restoreLogger = setStructuredLogSink((record) => logs.push(record));
  try {
    const response = await request("/__contract/business-error", {
      headers: { "x-request-id": "trace-business-error" },
    });
    assertErrorContract(
      response.status,
      response.body,
      409,
      "JOB_NOT_OPEN",
      "trace-business-error"
    );
    assert.equal(logs.length, 0);
  } finally {
    restoreLogger();
  }
});

test("external service failures preserve and safely log nested causes", async () => {
  const logs: Array<Record<string, unknown>> = [];
  const restoreLogger = setStructuredLogSink((record) => logs.push(record));
  try {
    const response = await request("/__contract/external-error", {
      headers: { "x-request-id": "trace-cloudinary-failure" },
    });
    assertErrorContract(
      response.status,
      response.body,
      503,
      "SERVICE_UNAVAILABLE",
      "trace-cloudinary-failure"
    );
    assert.doesNotMatch(
      JSON.stringify(response.body),
      /Cloudinary|TEST_ONLY_CLOUDINARY_API_KEY_NOT_REAL/
    );
    assert.equal(logs.length, 1);
    assert.equal(logs[0].level, "error");
    assert.equal(logs[0].source, "cloudinary");
    assert.equal(logs[0].requestId, "trace-cloudinary-failure");
    assert.equal(logs[0].errorCode, "SERVICE_UNAVAILABLE");
    assert.equal(logs[0].httpStatus, 503);
    assert.equal(typeof logs[0].timestamp, "string");
    assert.equal(typeof logs[0].errorName, "string");
    assert.equal(typeof logs[0].stack, "string");

    const causes = logs[0].cause as Array<{ message: string }>;
    assert.match(causes[0].message, /connection refused/);
    assert.doesNotMatch(
      JSON.stringify(logs[0]),
      /TEST_ONLY_CLOUDINARY_API_KEY_NOT_REAL|test_user|NOT_A_REAL_PASSWORD_TEST_ONLY|db\.invalid/
    );
    assert.match(JSON.stringify(logs[0]), /\[REDACTED\]/);
  } finally {
    restoreLogger();
  }
});

test("unknown Prisma failures are unexpected database failures with safe responses", async () => {
  const logs: Array<Record<string, unknown>> = [];
  const restoreLogger = setStructuredLogSink((record) => logs.push(record));
  try {
    const response = await request("/__contract/unknown-prisma", {
      headers: { "x-request-id": "trace-unknown-prisma" },
    });
    assertErrorContract(
      response.status,
      response.body,
      500,
      "DATABASE_FAILURE",
      "trace-unknown-prisma"
    );
    assert.doesNotMatch(
      JSON.stringify(response.body),
      /Prisma raw|database credentials/
    );
    assert.equal(logs.length, 1);
    assert.equal(logs[0].source, "database");
    assert.equal(logs[0].errorCode, "DATABASE_FAILURE");
    assert.equal(logs[0].httpStatus, 500);
  } finally {
    restoreLogger();
  }
});

test("unexpected thrown values use safe response and structured request-correlated logs", async () => {
  const logs: Array<Record<string, unknown>> = [];
  const restoreLogger = setStructuredLogSink((record) => logs.push(record));
  try {
    const response = await request("/__contract/thrown-value", {
      headers: { "x-request-id": "trace-thrown-value" },
    });
    assertErrorContract(
      response.status,
      response.body,
      500,
      "INTERNAL_ERROR",
      "trace-thrown-value"
    );
    assert.doesNotMatch(
      JSON.stringify(response.body),
      /access_token|secret-value/
    );
    assert.equal(logs.length, 1);
    assert.equal(logs[0].requestId, "trace-thrown-value");
    assert.equal(logs[0].errorCode, "INTERNAL_ERROR");
    assert.equal(logs[0].httpStatus, 500);
    assert.doesNotMatch(JSON.stringify(logs[0]), /secret-value/);
  } finally {
    restoreLogger();
  }
});

test("legacy success responses remain normalized by apiContract", async () => {
  const response = await request("/__contract/success", {
    headers: { "x-request-id": "trace-success" },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    success: true,
    data: { marker: "success-contract-preserved" },
  });
});
