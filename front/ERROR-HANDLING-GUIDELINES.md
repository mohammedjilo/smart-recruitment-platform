# Error Handling Guidelines

This document is the developer-facing guardrail for the completed error-handling
architecture.

It is intentionally short, practical, and specific. It explains the official behavior that
future code must respect, and it shows the patterns that are considered architectural
bypasses.

This file does not replace the historical architecture report in `ERROR-PRESENTATION.md`.
It is the live developer guide for how to write and change error-handling code without
weakening the system.

## 1. Official responsibility boundaries

### Backend

```
throw / rejected error
→ AppError / structured classification
→ backend global error handler
→ safe public error envelope
→ requestId preserved in response
→ structured logging with redaction
```

Rules:

- backend errors must be classified before returning to the client
- public API responses must use the safe envelope shape
- raw stack traces, Prisma internals, tokens, headers, database details, secrets, and
  provider payloads must not be exposed to users
- request correlation must use the established requestId flow

### Frontend query pipeline

```
RTK Query
→ normalizeApiError
→ getQueryState
→ getQueryPresentation
→ consumer-selected UI
```

### Frontend mutation pipeline

```
RTK Query mutation
→ normalizeApiError
→ getMutationState
→ getMutationPresentation
→ consumer-selected UI
```

### Form pipeline

```
backend fieldErrors
→ normalizeApiError
→ applyApiFieldErrors
→ React Hook Form field state
```

### Runtime crash pipeline

```
React render exception
→ AppErrorBoundary
→ safe fallback UI
→ recovery
```

Important boundary:

- API failures belong to the normalization and semantic state layers
- runtime render crashes belong to the Error Boundary
- do not route render crashes through API error handling

## 2. Do / Don't

### Do

Use the canonical utilities:

```ts
const queryState = getQueryState(query, { isEmpty })
const presentation = getQueryPresentation(queryState, "section")
```

```ts
const mutationState = getMutationState(result)
const presentation = getMutationPresentation(mutationState, {
   surface: "action",
   importance: "routine"
})
```

```ts
applyApiFieldErrors(error, setError)
```

This keeps the architecture consistent and ensures the same semantic rules apply across
the app.

### Don't

Do not create a local error system that duplicates the global one.

Avoid patterns like:

```ts
if (error) rows = []
```

when an error or stale state should remain visible instead of being silently replaced by
empty data.

Avoid:

```ts
data ?? []
```

when a failed query should not become a fake empty success state.

Avoid:

```ts
if (error?.message) {
   showAlert({ type: "error", text: error.message })
}
```

when the semantic presentation layer already determines whether the correct destination is
a page error, a section error, inline field feedback, a toast, or a dialog.

Also avoid:

- direct `throw new Error(...)` inside UI code as a substitute for normal API error
  handling
- duplicate backend parsing in feature code
- silently swallowing real user-facing failures
- global auto-toast from API infrastructure
- automatic mutation retry logic added in feature components

## 3. Query rules

These rules are permanent:

- never treat an error as empty
- never convert failed stats to zero values without explicit success evidence
- use `currentData` for query rendering when argument-sensitive data is involved
- preserve stale data when a query is in `stale_error`
- abort is not a user-visible error
- empty requires successful empty data, not a failed request
- no-results requires valid filter/search evidence
- independent queries remain independent
- page/section failures remain contextual

Practical rule:

If a request failed, the UI must not silently look like the query succeeded with no rows.

## 4. Mutation rules

The canonical mutation states are:

- `idle`
- `submitting`
- `success`
- `error`
- `aborted`
- `inconsistent`

Required rules:

- no duplicate mutation state machine
- no parallel Redux mutation state for the same lifecycle
- no automatic mutation retry
- preserve `.unwrap()` semantics and lifecycle behavior
- keep cache invalidation consistent with existing RTK Query behavior
- important business actions must use confirmation where appropriate
- form field errors remain local and contextual
- abort remains silent

## 5. Error message rules

The message hierarchy is:

1. normalized safe backend message
2. contextual frontend fallback
3. safe generic fallback

The hierarchy is strict.

Never expose:

- stack traces
- raw RTK Query errors
- provider payloads
- Prisma internals
- SQL details
- database URLs
- tokens
- headers
- cookies
- credentials
- internal source paths

If a value is sensitive, it must be redacted or dropped before it reaches the user.

## 6. Notification rules

The decision boundary is fixed:

- field validation → field/form UI
- form validation or business error → inline/form context
- query/page failure → page or section error state
- routine action result → toast
- important confirmation → SweetAlert/dialog
- important business acknowledgment → dialog
- intentional abort → silent
- React runtime crash → Error Boundary fallback

Do not convert the API layer into a global notification system.

## 7. SweetAlert rules

SweetAlert / `showAlert` is for:

- confirmation flows
- important acknowledgment
- decision-required business actions

Toast is for:

- routine transient feedback

Inline/form state is for:

- local validation feedback
- field errors
- form-level state

Query error state is for:

- page and section fetch failures

`showAlert` must not become a general-purpose replacement for API error handling.

## 8. Error Boundary rules

Runtime render crashes are not API errors.

Rules:

- do not send a render exception through `normalizeApiError`
- do not use Toast as the primary crash fallback
- do not auto-logout after a render crash
- do not wrap every component in ad hoc try/catch blocks
- use the established `AppErrorBoundary`

The boundary is a safe user-facing recovery mechanism, not a global error router.

## 9. Auth / refresh rules

The refresh contract is fixed:

- concurrent 401s use a shared refresh
- transient refresh network failures do not clear the session
- refresh timeout does not silently destroy session state
- definitive refresh/auth failure follows the established cleanup path
- no infinite re-auth loop
- preserve the RTK Query AbortSignal
- do not re-implement refresh logic inside a feature component

## 10. Retry rules

### Queries

- retry only according to the established Phase 4 policy

### Mutations

- no automatic mutation retry

### User-facing retry

- any retry shown to the user must be explicit and intentional

### Abort

- abort never becomes a retried request

Do not add ad hoc retries inside components as a workaround.

## 11. Global vs local responsibility

| Concern                 | Owner                                              |
| ----------------------- | -------------------------------------------------- |
| Backend classification  | backend error system                               |
| Backend serialization   | global error handler                               |
| Sensitive log redaction | structured logger                                  |
| Frontend normalization  | `normalizeApiError`                                |
| Query semantic state    | `getQueryState`                                    |
| Mutation semantic state | `getMutationState`                                 |
| Presentation decision   | `getQueryPresentation` / `getMutationPresentation` |
| Field errors            | `applyApiFieldErrors`                              |
| Routine notification    | `ToastProvider` / notification helpers             |
| Important confirmation  | SweetAlert / dialog                                |
| Runtime crash handling  | `AppErrorBoundary`                                 |

This is the main architectural reference for future code changes.

## 12. AI / Copilot development rules

Before changing error behavior, always do the following:

1. inspect the existing semantic model
2. reuse the existing utilities instead of creating a parallel path
3. do not create a second error taxonomy
4. preserve the current contracts and lifecycle rules
5. run the relevant tests
6. report intentional exceptions explicitly

Examples of bad future changes to avoid:

- adding `try/catch` around every API call instead of using the normalizer
- replacing real API errors with generic `Error` objects in feature code
- using `data ?? []` to hide failed requests
- adding global Toast calls inside API infrastructure
- auto-retrying mutations in feature components
- using `Swal.fire` for every failure response
- creating new Redux state for transient request errors when the semantic model already
  exists

## 13. Test requirements

When changing any error-related behavior, run the relevant checks.

Minimum recommended regression set:

```bash
npm run test:api-errors
npm run test:api-reliability
npm run test:query-state
npm run test:mutation-state
npm run test:presentation-policy
npm run test:error-boundary
npm run build
npm run lint
```

Guideline:

- backend changes → backend error tests and build/lint
- query changes → query + API error + reliability tests
- mutation changes → mutation + API error + reliability tests
- presentation changes → presentation + query/mutation tests
- Error Boundary changes → boundary + full regression set

## 14. When to add a new abstraction

Do not create a new error utility just because a component needs a slightly different
message.

Create a new abstraction only when:

- multiple consumers share the same semantic responsibility
- the existing abstraction cannot safely represent the case
- the new abstraction has a clear single responsibility
- it does not duplicate an existing layer

This especially matters for:

- error helpers
- notifications
- loading state logic
- semantic state logic

## 15. Intentional exceptions

The known exceptions are valid and must remain explicit:

- important confirmation flows in SweetAlert
- intentional silent cleanup/cancellation cases
- technical raw-error inspection only for lifecycle / abort / field handling

These exceptions must be:

- explicit
- justified
- documented
- not silently introduced

## 16. Static guardrails decision

This project intentionally does not add a brittle regex-based static analyzer for
architecture enforcement.

Reason:

- the error architecture is already enforced by the canonical utilities and test suite
- a broad regex-based guard would produce false positives and slow down future code
  changes
- the recommended guardrail is code review + existing tests + clear developer rules

If a future static rule is added, it must be narrow, maintainable, and based on the actual
canonical architecture rather than broad textual matching.

## 17. Anti-pattern audit target

The repo should be reviewed for the following patterns and they should only remain where
justified:

- `data ?? []`
- `error?.status` / `error?.message` used as local presentation logic outside the
  canonical flows
- `catch {}` / empty catches that hide a user-visible failure
- `showToast` or `showAlert` used in API infrastructure or non-contextual global layers
- direct `res.status(...).json(...)` error responses outside the global backend error flow

The target is zero unjustified architecture bypasses.

## 18. Summary

This architecture is complete and stable.

The developer rule is simple:

- reuse the existing canonical layers
- do not invent a second error path
- do not duplicate the semantic state model
- do not turn API infrastructure into UI notification logic
- do not swallow real failures
- keep runtime crashes in the Error Boundary
- validate all changes with the established regression suite

When in doubt, follow the canonical pipeline instead of improvising a local workaround.
