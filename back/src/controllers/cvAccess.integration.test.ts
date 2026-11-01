import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../config/db.js";
import { createApp } from "../index.js";
import { signAccessToken } from "../utils/tokens.js";

process.env.JWT_SECRET = "cv-access-isolated-test-secret";

const originalUserFindUnique = Object.getOwnPropertyDescriptor(
  prisma.user,
  "findUnique"
);
const originalCompanyFindUnique = Object.getOwnPropertyDescriptor(
  prisma.company,
  "findUnique"
);
const originalApplicationFindFirst = Object.getOwnPropertyDescriptor(
  prisma.application,
  "findFirst"
);
const originalPrivateDownloadUrl = cloudinary.utils.private_download_url;
const authorizedApplicationId = "11111111-1111-4111-8111-111111111111";
const deniedApplicationId = "22222222-2222-4222-8222-222222222222";

let server: ReturnType<ReturnType<typeof createApp>["listen"]>;
let baseUrl: string;
const applicationQueries: Array<Record<string, unknown>> = [];

before(async () => {
  Object.defineProperty(prisma.user, "findUnique", {
    configurable: true,
    writable: true,
    value: async ({ where }: { where: { id: string } }) =>
      where.id === "demo-admin"
        ? {
            id: where.id,
            role: "ADMIN",
            accountStatus: "ACTIVE",
            adminRoleAssignments: [
              { adminRole: { name: "DEMO_ADMIN" } },
            ],
          }
        : {
            id: where.id,
            role: "USER",
            accountStatus: "ACTIVE",
          },
  });
  Object.defineProperty(prisma.company, "findUnique", {
    configurable: true,
    writable: true,
    value: async ({ where }: { where: { id: string } }) => ({
      id: where.id,
      status: "ACTIVE",
      approvalStatus: where.id === "approved-company" ? "APPROVED" : "PENDING",
    }),
  });
  Object.defineProperty(prisma.application, "findFirst", {
    configurable: true,
    writable: true,
    value: async (args: Record<string, unknown>) => {
      applicationQueries.push(args);
      if (
        args.where &&
        JSON.stringify(args.where).includes(authorizedApplicationId)
      ) {
        return {
          cvPublicId: "private-fixture-cv-id",
          cvResourceType: "raw",
          cvDeliveryType: "authenticated",
        };
      }
      return null;
    },
  });
  cloudinary.utils.private_download_url = (() =>
    "https://signed-download.example.test/temporary") as typeof cloudinary.utils.private_download_url;

  await new Promise<void>((resolve, reject) => {
    server = createApp().listen(0, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("CV test server did not bind to a TCP port"));
        return;
      }
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
    server.once("error", reject);
  });
});

after(async () => {
  if (originalUserFindUnique) {
    Object.defineProperty(prisma.user, "findUnique", originalUserFindUnique);
  } else Reflect.deleteProperty(prisma.user, "findUnique");
  if (originalCompanyFindUnique) {
    Object.defineProperty(prisma.company, "findUnique", originalCompanyFindUnique);
  } else Reflect.deleteProperty(prisma.company, "findUnique");
  if (originalApplicationFindFirst) {
    Object.defineProperty(
      prisma.application,
      "findFirst",
      originalApplicationFindFirst
    );
  } else Reflect.deleteProperty(prisma.application, "findFirst");
  cloudinary.utils.private_download_url = originalPrivateDownloadUrl;

  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

const requestCv = (applicationId: string, token?: string) =>
  fetch(
    `${baseUrl}/api/application/${applicationId}/cv?publicId=caller-controlled&url=https%3A%2F%2Ffiles.example.test%2Ffake.pdf`,
    {
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
    }
  );

test("unauthenticated and cross-owner requests cannot obtain CV links", async () => {
  const missingAuth = await requestCv(authorizedApplicationId);
  assert.equal(missingAuth.status, 401);

  const candidateToken = signAccessToken({
    id: "another-candidate",
    role: "user",
  });
  const denied = await requestCv(deniedApplicationId, candidateToken);
  assert.equal(denied.status, 404);
  assert.deepEqual(applicationQueries.at(-1)?.where, {
    id: deniedApplicationId,
    userId: "another-candidate",
  });

  const authorized = await requestCv(authorizedApplicationId, candidateToken);
  assert.equal(authorized.status, 200);
  assert.equal(
    authorized.headers.get("cache-control"),
    "private, no-store, max-age=0"
  );
});

test("company access is scoped through its owned job and authorized responses are no-store", async () => {
  const companyToken = signAccessToken({
    id: "approved-company",
    role: "company",
  });
  const denied = await requestCv(deniedApplicationId, companyToken);
  assert.equal(denied.status, 404);
  assert.deepEqual(applicationQueries.at(-1)?.where, {
    id: deniedApplicationId,
    job: { companyId: "approved-company" },
  });

  const authorized = await requestCv(authorizedApplicationId, companyToken);
  assert.equal(authorized.status, 200);
  assert.equal(authorized.headers.get("cache-control"), "private, no-store, max-age=0");
  const response = (await authorized.json()) as {
    data: { url: string; expiresAt: string };
  };
  assert.equal(
    response.data.url,
    "https://signed-download.example.test/temporary"
  );
  assert.ok(Date.parse(response.data.expiresAt) > Date.now());
});

test("DEMO_ADMIN CV download endpoints remain denied by the default allowlist", async () => {
  const token = signAccessToken({ id: "demo-admin", role: "user" });
  const response = await requestCv(authorizedApplicationId, token);
  assert.equal(response.status, 404);
});
