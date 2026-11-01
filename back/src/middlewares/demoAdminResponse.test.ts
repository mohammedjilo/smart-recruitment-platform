import assert from "node:assert/strict";
import { test } from "node:test";
import type { NextFunction, Request, Response } from "express";
import {
  redactDemoAdminCvReferences,
  redactDemoAdminResponse,
} from "./demoAdminResponse.js";

const containsCvReference = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(containsCvReference);
  if (!value || typeof value !== "object") {
    return (
      typeof value === "string" &&
      (/^https?:\/\//i.test(value) &&
        (/(?:^|\/)raw\/(?:upload|download|authenticated)(?:\/|[?#]|$)/i.test(value) ||
          /applications\/cvs\//i.test(value) ||
          /\.pdf(?:[?#]|$)/i.test(value)))
    );
  }

  return Object.entries(value).some(
    ([key, child]) =>
      (key.toLowerCase() !== "resumetype" &&
        /(cv|resume)/i.test(key)) ||
      /^(file|download|storage|asset|cloudinary).*(url|uri|id|path|key|ref|token|link|public)/i.test(
        key
      ) ||
      containsCvReference(child)
  );
};

test("Demo Admin response boundary removes references from all response shapes", () => {
  const responseShapes = {
    list: {
      data: [
        {
          cvId: "private-fixture-storage-id",
          cvUrl: "https://files.example.test/candidate.pdf",
          attachment: {
            downloadHref:
              "https://res.cloudinary.com/demo/raw/upload/applications/cvs/sample",
          },
        },
      ],
    },
    detail: {
      data: {
        profileSnapshot: {
          candidateResumeAsset: "private-fixture-reference",
          attachmentUrl: "https://files.example.test/path/application.pdf",
        },
      },
    },
    candidateProfile: {
      data: {
        profile: {
          cvPath: "private-fixture-path",
          fileStorageReference: "private-fixture-reference",
          signedUrl:
            "https://res.cloudinary.com/test/raw/download?expires_at=1900000000",
        },
      },
    },
    profileSnapshot: {
      data: {
        snapshot: {
          resume: {
            storageKey: "private-fixture-key",
          },
          resumeType: "UPLOAD",
        },
      },
    },
  };

  const redacted = redactDemoAdminCvReferences(responseShapes);

  assert.equal(containsCvReference(redacted), false);
  assert.equal(
    ((redacted as typeof responseShapes).profileSnapshot.data.snapshot
      .resumeType),
    "UPLOAD"
  );
});

test("response middleware redacts only requests marked as Demo Admin", () => {
  const payload = {
    data: {
      cvUrl: "https://files.example.test/candidate.pdf",
      displayName: "Demo Candidate",
    },
  };
  let captured: unknown;
  let proceeded = false;
  const response = {
    json(body: unknown) {
      captured = body;
      return response;
    },
  } as Response;
  const next = (() => {
    proceeded = true;
  }) as NextFunction;

  redactDemoAdminResponse(
    { isDemoAdmin: true } as Request,
    response,
    next
  );
  response.json(payload);

  assert.equal(proceeded, true);
  assert.deepEqual(captured, {
    data: { displayName: "Demo Candidate" },
  });

  let ordinaryResponse: unknown;
  const ordinaryRes = {
    json(body: unknown) {
      ordinaryResponse = body;
      return ordinaryRes;
    },
  } as Response;
  redactDemoAdminResponse({ isDemoAdmin: false } as Request, ordinaryRes, next);
  ordinaryRes.json(payload);
  assert.deepEqual(ordinaryResponse, payload);
});
