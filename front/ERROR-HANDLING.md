# Frontend API Error Handling

## Central model

RTK Query failures are normalized at the shared base-query boundary into
`NormalizedApiError`:

```ts
{
   kind: "validation" | "authentication" | "authorization" | "not_found" |
      "conflict" | "business" | "upload" | "network" | "timeout" |
      "rate_limited" | "service_unavailable" | "server" | "client" |
      "aborted" | "unknown",
   code: string,
   message: string,
   status?: number,
   fieldErrors?: Record<string, string>,
   requestId?: string,
   retryable: boolean,
   isAborted: boolean
}
```

The stable Backend `error.code` is retained; `kind` is the semantic grouping
for client logic. The normalizer accepts only the Backend error envelope
`{ success: false, error: { code, message, fieldErrors? }, requestId? }`.
Malformed bodies and transport/serialized errors receive a safe fallback rather
than having their raw payload, stack, or transport text exposed.

`requestId` and `fieldErrors` are optional. `retryable` is descriptive
metadata; the API reliability layer has a separate conservative retry policy.
Aborts are explicitly marked and are not retryable.

## Code classification

| `kind` | Backend codes / conditions |
| --- | --- |
| `validation` | `VALIDATION_ERROR`, `INVALID_PAGINATION`, `INVALID_RELATION` |
| `authentication` | `UNAUTHORIZED`, or HTTP 401 fallback |
| `authorization` | `FORBIDDEN`, or HTTP 403 fallback |
| `not_found` | `RESOURCE_NOT_FOUND`, `*_NOT_FOUND`, or HTTP 404 fallback |
| `conflict` | `CONFLICT`, duplicate-application/resource, and application/question state conflict codes; or HTTP 409 fallback |
| `business` | `COMPANY_NOT_APPROVED`, job deadline/state/ownership, question/answer, required-question, and resume domain codes |
| `upload` | `INVALID_UPLOAD` |
| `rate_limited` | `RATE_LIMITED`, or HTTP 429 fallback |
| `timeout` | `TIMEOUT`, `AI_TIMEOUT`, timeout transport failures, or HTTP 408/504 fallback |
| `service_unavailable` | `SERVICE_UNAVAILABLE`, `AI_UNAVAILABLE`, `AI_INVALID_RESPONSE`, or HTTP 502/503 fallback |
| `server` | `DATABASE_FAILURE`, `INTERNAL_ERROR`, or other HTTP 5xx fallback |
| `client` | `BAD_REQUEST`, `PAYLOAD_TOO_LARGE`, or HTTP 400/413 fallback |
| `network` | Fetch/network failure |
| `aborted` | Abort/cancelled request |
| `unknown` | Unrecognized errors without a more specific classification |

Unrecognized Backend codes are preserved and classified by HTTP status; they
are not silently renamed or dropped.

## Integration boundaries

- `baseQueryWithNormalizedErrors` wraps the API reliability layer. It normalizes
  only the final request/refresh failure, after bounded retry and
  reauthentication have completed.
- `getApiErrorDetails` is a compatibility facade over `normalizeApiError`.
- `applyApiFieldErrors` reads normalized `fieldErrors` through the same
  normalizer.
- Success responses, cache behavior, and endpoint lifecycle are unchanged.
- No page, component, toast, alert, or visual error presentation was changed.
  Existing consumers can adopt `kind`, `code`, `requestId`, and abort/retry
  metadata in a later UI-scoped change.

## Phase 4 request reliability policies

### Reauthentication and refresh coordination

- A request that receives HTTP 401 initiates or joins a shared, single-flight
  `POST /api/auth/refresh`.
- The refresh response is accepted only when it has the existing backend shape
  `{ success: true, data: { token: string } }`.
- A valid refresh updates the Redux access token and persisted `token`, then
  retries the original request once. A second 401 is returned without another
  refresh attempt.
- Refresh HTTP 401/403 or an explicit `UNAUTHORIZED` contract response clears
  authentication and RTK Query cache. A malformed refresh response is a safe
  service failure and does not clear the session.
- Refresh network and timeout failures are returned to the normalizer and do
  not clear session state. The shared refresh uses an independent abort signal,
  so cancellation of one waiting query does not cancel work needed by other
  requests. Each waiter can still abort its own wait.
- Requests that began with an old token and receive 401 after a peer has
  installed a newer token retry with the current Redux token rather than
  starting another refresh.

### Retry policy

Only RTK Query operations whose `api.type` is `query` may be automatically
retried. A query gets at most **2 total attempts** (the initial request and one
retry), with a **300 ms delay** before the retry. Candidates are fetch/network
failures, timeout failures, and HTTP 502, 503, or 504. HTTP 500 is intentionally
not included in this conservative list.

HTTP 400, 401, 403, 404, 409, business errors, invalid uploads, and all other
statuses are not retried. A 401 follows the reauthentication flow instead.
Mutations have no automatic retry, including transient failures, to avoid
duplicate side effects. A successfully refreshed request may be repeated once
because its initial response was specifically an authentication rejection;
this is separate from generic retry.

Backoff waits are abort-aware. If the request is cancelled during the wait, the
timer and abort listener are removed and no retry starts.

### Timeout and abort

`fetchBaseQuery` applies a **30-second per-attempt timeout**, including the
refresh request. RTK Query composes its request `AbortSignal` with its timeout
signal; timeout failures retain the `TIMEOUT_ERROR` marker and become
`NormalizedApiError.kind === "timeout"`.

The custom fetch adapter forwards `RequestInit.signal` unchanged and does not
create or retain its own `AbortController`. Completed, failed, timed-out, and
aborted requests therefore leave no application-maintained active-controller
references. An RTK Query abort is returned as an abort failure, not retried and
not classified as a server/network failure.

Queries and mutations both receive the per-attempt timeout and abort behavior;
only queries receive the transient retry described above.

## Verification

Run the normalizer tests with:

```sh
npm run test:api-errors
```

The tests cover valid and malformed Backend envelopes, field errors, request
IDs, domain-code preservation, network/timeout/abort classification,
idempotent normalization, and exclusion of internal error details.

Run the request-reliability tests with:

```sh
npm run test:api-reliability
```

These cover refresh success/failure and malformed payload handling, shared
refresh for concurrent 401s, one-time reauthentication, network/timeout
session preservation, query retry boundaries and backoff, mutation retry
safety, timeout normalization, AbortSignal forwarding, abort-aware wait and
cleanup, and refreshed-token persistence.
