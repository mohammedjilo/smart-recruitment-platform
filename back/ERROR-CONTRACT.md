# Backend Error Contract

## Scope

This document describes responses produced by the backend global error
middleware. Clients should branch on `error.code`, not on human-readable
messages. The code catalogue reflects the current TypeScript `ErrorCode` type;
it does not imply that every endpoint can emit every code.

## Successful responses

The API response middleware normalizes successful controller responses to
this envelope:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {},
  "meta": {},
  "stats": {}
}
```

`data` is passed through resource DTO serialization. `message`, `meta`, and
`stats` are optional and are included only when supplied. The controller or
route sets the HTTP status. The exact data and metadata depend on the endpoint.

## Error response

Errors handled by the global error middleware use this envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "fieldErrors": {
      "email": "Invalid email"
    }
  },
  "requestId": "request-id"
}
```

- `error.code` is the machine-readable error code.
- `error.message` is the public message selected by the error source or
  middleware.
- `error.fieldErrors` is optional. Validation issues are keyed by their
  dot-separated field path; a form-level issue may use `form`.
- Top-level `requestId` is included when assigned to the request. The
  application uses the incoming `x-request-id` value when present, or
  generates a UUID otherwise.
- The HTTP status is in the HTTP response, not duplicated in the JSON body.
- The global error envelope does not include `stack`, `cause`, `source`,
  `classification`, `retryable`, raw Prisma errors, or provider diagnostics.

`apiContract` converts legacy `{ "success": false }` JSON responses into an
error passed to the global handler. It does not return the legacy error body as
the public response.

## Error normalization and HTTP statuses

The global handler preserves the HTTP status and code of an `AppError`.
Middleware also normalizes known error classes and infrastructure failures.
Mappings verified in the current implementation include:

| HTTP status | Code / behavior |
| --- | --- |
| 400 | `BAD_REQUEST` for malformed or invalid JSON request bodies; `VALIDATION_ERROR` for Zod validation; `INVALID_UPLOAD` for Multer/upload validation errors; `INVALID_RELATION` for Prisma foreign-key errors (`P2003`) |
| 401 | `UNAUTHORIZED` for missing, malformed, or expired credentials |
| 403 | `FORBIDDEN` for access denial; `ACCOUNT_DEACTIVATED` for inactive accounts |
| 404 | `RESOURCE_NOT_FOUND` for missing routes and normalized missing records (`P2025`) |
| 409 | `DUPLICATE_RESOURCE` for unique constraint errors (`P2002`); `CONFLICT` for Prisma relation/state conflicts (`P2014`, `P2034`) |
| 413 | `PAYLOAD_TOO_LARGE` for an oversized parsed request body |
| 500 | `INTERNAL_ERROR` for an unrecognized thrown error; `DATABASE_FAILURE` for an unexpected Prisma operation or validation failure |
| 502 | `AI_INVALID_RESPONSE` for an invalid AI response; `AI_UNAVAILABLE` when an AI response has no usable text |
| 503 | `SERVICE_UNAVAILABLE` for database initialization/availability errors; `DATABASE_FAILURE` for Prisma panic/unknown-request failures; `AI_UNAVAILABLE` for AI provider failures |
| 504 | `TIMEOUT` for a database initialization timeout; `AI_TIMEOUT` for an AI timeout |

The `AppError` constructor has default codes for some statuses when a caller
does not supply a code. Many domain errors supply both status and code
explicitly. Therefore, there is no universal HTTP status for each domain code;
the status and code from the endpoint response are authoritative.

The `/api/auth/support-access` route also uses `express-rate-limit`. Its
rate-limit response is produced by that middleware rather than by the global
error handler, so it is not guaranteed to use the JSON envelope above.

## Error codes

The following generic codes are declared by the current `ErrorCode` type:

- `BAD_REQUEST`
- `CONFLICT`
- `DATABASE_FAILURE`
- `DUPLICATE_RESOURCE`
- `FORBIDDEN`
- `INTERNAL_ERROR`
- `INVALID_RELATION`
- `INVALID_UPLOAD`
- `PAYLOAD_TOO_LARGE`
- `RATE_LIMITED`
- `RESOURCE_NOT_FOUND`
- `SERVICE_UNAVAILABLE`
- `TIMEOUT`
- `UNAUTHORIZED`
- `VALIDATION_ERROR`

The current domain codes are:

- `AI_INVALID_RESPONSE`
- `AI_TIMEOUT`
- `AI_UNAVAILABLE`
- `APPLICATION_STATUS_FINAL`
- `ACCOUNT_DEACTIVATED`
- `COMPANY_ALREADY_REGISTERED`
- `COMPANY_NOT_APPROVED`
- `COMPANY_NOT_FOUND`
- `COMPANY_REGISTRATION_PENDING`
- `DUPLICATE_APPLICATION`
- `INVALID_APPLICATION_STATUS_TRANSITION`
- `INVALID_PAGINATION`
- `INVALID_QUESTION_ANSWER`
- `JOB_DEADLINE_INVALID`
- `JOB_DEADLINE_PASSED`
- `JOB_NOT_FOUND`
- `JOB_NOT_OPEN`
- `JOB_NOT_OWNED`
- `JOB_REOPEN_DEADLINE_REQUIRED`
- `QUESTION_HAS_HISTORICAL_ANSWERS`
- `QUESTION_JOB_MISMATCH`
- `REQUIRED_QUESTION_MISSING`
- `RESUME_REQUIRED`
- `USER_NOT_FOUND`
- `WITHDRAWN_APPLICATION_HISTORY_IMMUTABLE`

When adding a public error code, update the `ErrorCode` type and this
catalogue, and add or update tests for the relevant behavior.

## Validation, persistence, and unexpected errors

- Zod validation issues are returned as `VALIDATION_ERROR`; the middleware
  returns the first message for each field path in `fieldErrors`.
- Multer upload errors are returned as `INVALID_UPLOAD`. The configured
  maximum file size is 5 MB.
- Prisma known errors are normalized: `P2002` to `DUPLICATE_RESOURCE`,
  `P2025` to `RESOURCE_NOT_FOUND`, `P2003` to `INVALID_RELATION`, and `P2014`
  or `P2034` to `CONFLICT`.
- Other Prisma failures are returned using `DATABASE_FAILURE`,
  `SERVICE_UNAVAILABLE`, or `TIMEOUT` according to their type and code.
- Malformed JSON and oversized request bodies are normalized to
  `BAD_REQUEST` and `PAYLOAD_TOO_LARGE`, respectively.
- Unrecognized thrown errors are returned as `INTERNAL_ERROR`.

These are global normalization rules; endpoint-specific `AppError` call sites
may produce other codes and statuses from the catalogue.

## Logging and sensitive data

Expected and unexpected classifications are internal and are not included in
the public JSON envelope. Unexpected request failures are written as
structured logs with request ID, error code, HTTP status, route, method,
classification, source, and diagnostics. The logger traverses a bounded cause
chain and redacts common credential, token, and connection-string patterns.
Redaction is pattern-based and does not guarantee detection of arbitrary
sensitive content.

Do not put secrets, tokens, request bodies, or provider response payloads in
error messages. Never return stack traces, causes, database details, internal
paths, credentials, authorization headers, cookies, or raw provider responses
to API clients.

## Verification coverage

The backend error integration tests exercise representative behavior,
including request IDs, malformed JSON, authentication and permission errors,
validation field errors, missing resources, Prisma and upload normalization,
legacy error responses, and sanitized unexpected failures. This test coverage
does not imply that every code in the catalogue has a dedicated test.
