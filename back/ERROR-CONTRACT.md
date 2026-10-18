# Backend Error Contract

All API errors use the same JSON envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fieldErrors": {
      "email": "Invalid email"
    }
  },
  "requestId": "request-id"
}
```

`fieldErrors` is included only when a request field can be identified. The
`requestId` is included when request ID middleware has assigned one. Clients
should branch on `error.code`, not on human-readable messages.

Only `globalErrorHandler` serializes API error responses. Controllers and
middleware must pass errors to Express with `next(error)` or throw/reject from
an async handler. `apiContract` remains responsible for success response
compatibility; if it encounters a legacy `{ "success": false }` JSON body, it
converts it to a generic `AppError` and forwards it to the global handler
instead of returning the supplied error body.

## Status and code mapping

| HTTP status | Error code | Used for |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | Malformed JSON and invalid request payloads |
| 400 | `VALIDATION_ERROR` | Zod validation failures; may include `fieldErrors` |
| 400 | `INVALID_RELATION` | Invalid foreign-key relation |
| 400 | `INVALID_UPLOAD` | Invalid multipart upload, file type, or file signature |
| 401 | `UNAUTHORIZED` | Missing, invalid, or expired credentials |
| 403 | `FORBIDDEN` | Authenticated but disallowed or inactive account |
| 404 | `RESOURCE_NOT_FOUND` | Missing route or resource |
| 409 | `CONFLICT` | Conflicting update or transaction |
| 409 | `DUPLICATE_RESOURCE` | Unique constraint violation |
| 413 | `PAYLOAD_TOO_LARGE` | Request body exceeds configured parser limits |
| 429 | `RATE_LIMITED` | Rate limiting |
| 500 | `INTERNAL_ERROR` | Unexpected failures; implementation details are not sent to clients |
| 500 | `DATABASE_FAILURE` | Unknown or unexpected Prisma/database failure |
| 503 | `SERVICE_UNAVAILABLE` | Database or upstream service unavailable |
| 504 | `TIMEOUT` | Database request timed out |

Known Prisma errors are mapped to stable public codes. Unknown Prisma errors
and unexpected exceptions produce the generic 500 envelope. Server-side logs
include the request ID and original error for 5xx failures; original exception
details are never returned to the client.

## Error-code catalogue

The TypeScript `ErrorCode` union contains the codes inventoried from all
`new AppError(...)` call sites in `src` plus the infrastructure mappings in the
global handler. It intentionally keeps generic and domain codes distinct:

### Infrastructure

- `BAD_REQUEST`
- `DATABASE_FAILURE`
- `INTERNAL_ERROR`
- `PAYLOAD_TOO_LARGE`
- `RATE_LIMITED`
- `SERVICE_UNAVAILABLE`
- `TIMEOUT`

### Authentication and authorization

- `UNAUTHORIZED`
- `FORBIDDEN`

### Validation and uploads

- `VALIDATION_ERROR`
- `INVALID_PAGINATION`
- `INVALID_UPLOAD`

### Resource errors

- `INVALID_RELATION`
- `RESOURCE_NOT_FOUND`
- `COMPANY_NOT_FOUND`
- `JOB_NOT_FOUND`
- `USER_NOT_FOUND`

### Conflict errors

- `CONFLICT`
- `DUPLICATE_RESOURCE`
- `DUPLICATE_APPLICATION`
- `APPLICATION_STATUS_FINAL`
- `INVALID_APPLICATION_STATUS_TRANSITION`
- `QUESTION_HAS_HISTORICAL_ANSWERS`
- `WITHDRAWN_APPLICATION_HISTORY_IMMUTABLE`

### Business and domain errors

- `COMPANY_NOT_APPROVED`
- `INVALID_QUESTION_ANSWER`
- `JOB_DEADLINE_INVALID`
- `JOB_DEADLINE_PASSED`
- `JOB_NOT_OPEN`
- `JOB_NOT_OWNED`
- `JOB_REOPEN_DEADLINE_REQUIRED`
- `QUESTION_JOB_MISMATCH`
- `REQUIRED_QUESTION_MISSING`
- `RESUME_REQUIRED`

### External service errors

- `AI_INVALID_RESPONSE`
- `AI_TIMEOUT`
- `AI_UNAVAILABLE`

`AppError` codes are compile-time restricted to this inventory. Add a code to
the appropriate union and this catalogue when introducing a new public error.

## Error Classification & Logging

### Classification model

Classification uses the thrown error type and its public error code, with
source and explicitly supplied classification metadata for wrapped errors.
HTTP status is recorded and used for the safe response, but is not by itself
the expected/unexpected decision.

| Error type | Expected / unexpected | HTTP status | Error code | Log level |
| --- | --- | --- | --- | --- |
| Zod/request validation | Expected | 400 | `VALIDATION_ERROR` | No error log |
| Invalid/expired credentials | Expected | 401 | `UNAUTHORIZED` | No error log |
| Permission/account denial | Expected | 403 | `FORBIDDEN` | No error log |
| Missing resource or route | Expected | 404 | Domain not-found code or `RESOURCE_NOT_FOUND` | No error log |
| Known unique/relation/state conflict | Expected | 400/409 | `DUPLICATE_RESOURCE`, `INVALID_RELATION`, `CONFLICT`, or domain code | No error log |
| Known Multer/upload rejection | Expected | 400 | `INVALID_UPLOAD` | No error log |
| Other recognized client/business error | Expected by code | Original 4xx status | Domain code | No error log |
| Database unavailable/timeout/unknown Prisma failure | Unexpected infrastructure | 500/503/504 | `DATABASE_FAILURE`, `SERVICE_UNAVAILABLE`, or `TIMEOUT` | ERROR |
| Cloudinary or Google AI provider failure | Unexpected external service | 502/503/504 | Existing `SERVICE_UNAVAILABLE`, `AI_UNAVAILABLE`, `AI_TIMEOUT`, or `AI_INVALID_RESPONSE` | ERROR |
| Unhandled exception or unknown rejection | Unexpected internal | 500 | `INTERNAL_ERROR` | ERROR |
| Optional AI recommendation fallback | Handled degradation | Response remains successful | AI error code in warning metadata | WARN |
| Optional notification side-effect failure | Handled degradation | Response remains successful | Event metadata only | WARN |
| Development fallback JWT secret | Development-only warning | N/A | Event name | WARN |
| Server/database startup success | Operational event | N/A | Event name | INFO |

Expectedness comes from known error classes/codes or an explicit classification
on an `AppError`. Infrastructure codes such as `DATABASE_FAILURE`,
`SERVICE_UNAVAILABLE`, `TIMEOUT`, and AI provider codes are unexpected even
when their status is a 4xx/5xx response. Unknown Prisma request codes are
classified as database failures rather than authentication or validation
errors.

### Structured logging

The focused `structuredLogger` utility emits one JSON record with timestamp,
level, event, and environment. The global error handler classifies first, logs
unexpected failures second, then produces the sanitized public envelope.
Unexpected request-error records include request ID, error code, HTTP status,
route, method, source, classification, error name/message/stack, and up to five
cause entries. Expected client and business errors are not logged as server
errors, avoiding noisy 400/401/403/404 logs.

INFO is reserved for startup and successful scheduled operational work. WARN
is used for deliberate recommendation/notification fallbacks and development
secret fallback. ERROR is used for unexpected request, startup, database, and
scheduler failures. The backend has no separate fatal-level policy; fatal
termination continues to be determined by startup/process control.

### Request ID and causes

HTTP error logs use the request ID assigned by the existing request middleware;
the same value is returned to the client. Background startup/scheduler logs
have no request ID because they are outside an HTTP request lifecycle.
`AppError` uses the native `Error.cause` chain. External-service errors,
database startup errors, and duplicate-application translations preserve their
original error as a cause; diagnostics traverse a bounded five-level chain.

### Public and internal data

Only the stable error code, safe public message, optional field errors, and
request ID are returned to clients. Causes, stacks, provider messages, Prisma
messages, and internal paths remain internal. The structured logger does not
record request bodies, authorization headers, cookies, tokens, or provider
response payloads. Its diagnostic text redacts common credential assignments,
authorization credentials, and JWT-shaped tokens before recording error
messages, stacks, or cause summaries. Prisma query logging is disabled so
parameter values do not bypass this redaction policy.
