import assert from "node:assert/strict";
import { test } from "node:test";
import { AppError } from "../utils/appError.js";
import { CV_UPLOAD_OPTIONS, uploadRestrictedCv } from "../utils/cloudinary.js";
import {
  createDownloadAuthorization,
  CV_DOWNLOAD_TTL_MILLISECONDS,
  getCandidateApplicationCv,
  getCompanyApplicationCv,
} from "./cvAccess.service.js";
import { prisma } from "../config/db.js";

const authenticatedAsset = {
  cvPublicId: "private-demo-cv-public-id",
  cvResourceType: "raw",
  cvDeliveryType: "authenticated",
};

const replace = (
  target: object,
  property: string,
  value: unknown
) => {
  const original = Object.getOwnPropertyDescriptor(target, property);
  Object.defineProperty(target, property, {
    configurable: true,
    writable: true,
    value,
  });
  return () => {
    if (original) Object.defineProperty(target, property, original);
    else Reflect.deleteProperty(target, property);
  };
};

test("CV uploads request raw authenticated delivery and reject downgraded results", async () => {
  assert.deepEqual(CV_UPLOAD_OPTIONS, {
    resource_type: "raw",
    type: "authenticated",
    folder: "applications/cvs",
  });

  let receivedOptions: typeof CV_UPLOAD_OPTIONS | undefined;
  const result = await uploadRestrictedCv(
    async (_data, options) => {
      receivedOptions = options;
      return { resource_type: "raw", type: "authenticated" };
    },
    "fixture-only-data"
  );
  assert.deepEqual(receivedOptions, CV_UPLOAD_OPTIONS);
  assert.equal(result.type, "authenticated");

  await assert.rejects(
    uploadRestrictedCv(
      async () => ({ resource_type: "raw", type: "upload" }),
      "fixture-only-data"
    ),
    (error: unknown) =>
      error instanceof AppError && error.code === "CV_STORAGE_UNAVAILABLE"
  );
});

test("CV authorization signs only database-owned authenticated identifiers with short expiry", () => {
  const now = 1_900_000_000_000;
  let received: { publicId: string; expiresAt: number } | undefined;
  const authorization = createDownloadAuthorization(
    authenticatedAsset,
    now,
    (publicId, expiresAt) => {
      received = { publicId, expiresAt };
      return "https://signed-download.example.test/temporary";
    }
  );

  assert.deepEqual(received, {
    publicId: authenticatedAsset.cvPublicId,
    expiresAt: Math.floor(now / 1000) + CV_DOWNLOAD_TTL_MILLISECONDS / 1000,
  });
  assert.equal(
    Date.parse(authorization.expiresAt) - now,
    CV_DOWNLOAD_TTL_MILLISECONDS
  );
  assert.equal(
    authorization.url,
    "https://signed-download.example.test/temporary"
  );
});

test("legacy public assets and missing assets cannot receive signed URLs", () => {
  assert.throws(
    () =>
      createDownloadAuthorization({
        ...authenticatedAsset,
        cvDeliveryType: "upload",
      }),
    (error: unknown) =>
      error instanceof AppError && error.code === "CV_MIGRATION_REQUIRED"
  );
  assert.throws(
    () => createDownloadAuthorization({ ...authenticatedAsset, cvPublicId: null }),
    (error: unknown) =>
      error instanceof AppError && error.code === "CV_NOT_FOUND"
  );
});

test("candidate and company CV authorization queries use ownership relationships", async () => {
  const where: unknown[] = [];
  const restore = replace(
    prisma.application,
    "findFirst",
    async (args: { where: unknown }) => {
      where.push(args.where);
      return authenticatedAsset;
    }
  );

  try {
    const candidate = await getCandidateApplicationCv(
      "application-id",
      "candidate-id"
    );
    const company = await getCompanyApplicationCv(
      "application-id",
      "company-id"
    );

    assert.deepEqual(where, [
      { id: "application-id", userId: "candidate-id" },
      { id: "application-id", job: { companyId: "company-id" } },
    ]);
    assert.equal(typeof candidate.url, "string");
    assert.equal(typeof company.url, "string");
  } finally {
    restore();
  }
});

test("unknown application or user cannot access another record's CV", async () => {
  const restore = replace(prisma.application, "findFirst", async () => null);
  try {
    await assert.rejects(
      getCandidateApplicationCv("production-application-id", "other-user-id"),
      (error: unknown) =>
        error instanceof AppError && error.statusCode === 404
    );
    await assert.rejects(
      getCompanyApplicationCv("production-application-id", "other-company-id"),
      (error: unknown) =>
        error instanceof AppError && error.statusCode === 404
    );
  } finally {
    restore();
  }
});
