import assert from "node:assert/strict";
import test from "node:test";
import { ApplicationStatus } from "@prisma/client";
import { applicationStatusSchema } from "../validation/application.validation";
import {
  assertApplicationTransition,
  assertApplicationWithdrawal,
  canWithdrawApplication,
} from "./application.state";

test("users may withdraw pending, in-progress, shortlisted, interview, and accepted applications", () => {
  const allowed = [
    ApplicationStatus.PENDING,
    ApplicationStatus.REVIEWING,
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.ACCEPTED,
  ];

  for (const status of allowed) {
    assert.equal(canWithdrawApplication(status), true);
    assert.doesNotThrow(() => assertApplicationWithdrawal(status));
  }
});

test("rejected and withdrawn applications cannot be withdrawn", () => {
  for (const status of [
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN,
  ]) {
    assert.equal(canWithdrawApplication(status), false);
    assert.throws(() => assertApplicationWithdrawal(status), {
      code: "INVALID_APPLICATION_STATUS_TRANSITION",
    });
  }
});

test("company status API cannot directly assign WITHDRAWN", () => {
  assert.equal(
    applicationStatusSchema.safeParse({ status: "WITHDRAWN" }).success,
    false
  );
});

test("company lifecycle transitions remain restricted and terminal statuses remain immutable", () => {
  assert.doesNotThrow(() =>
    assertApplicationTransition(
      ApplicationStatus.PENDING,
      ApplicationStatus.REVIEWING
    )
  );
  assert.doesNotThrow(() =>
    assertApplicationTransition(
      ApplicationStatus.SHORTLISTED,
      ApplicationStatus.ACCEPTED
    )
  );
  assert.throws(
    () =>
      assertApplicationTransition(
        ApplicationStatus.PENDING,
        ApplicationStatus.ACCEPTED
      ),
    { code: "INVALID_APPLICATION_STATUS_TRANSITION" }
  );
  assert.throws(
    () =>
      assertApplicationTransition(
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.WITHDRAWN
      ),
    { code: "APPLICATION_STATUS_FINAL" }
  );
});
