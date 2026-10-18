# Unified Mutation State and Action Outcome

## Responsibility

```text
RTK Query mutation result
          ↓
getMutationState(rawResult)
          ↓
SemanticMutationState<TData>
          ↓
Forms / actions / buttons / dialogs
```

RTK Query remains the only owner of mutation lifecycle and result data.
`getMutationState` is a pure interpretation of the hook result; it adds no
Redux state, local lifecycle store, presentation, notification, retry, or
mutation-trigger behavior.

## States

`getMutationState<TData>` in `src/utils/mutationState.ts` returns:

```ts
type SemanticMutationState<TData> =
   | { status: "idle" }
   | { status: "submitting" }
   | { status: "success"; data?: TData }
   | { status: "error"; error: NormalizedApiError }
   | { status: "aborted"; error: NormalizedApiError }
   | { status: "inconsistent"; reason: MutationStateIssue }
```

`MutationActionOutcome<TData>` is a type-only subset of settled outcomes
(`success`, `error`, and `aborted`); it does not create an additional lifecycle
or store.

| State | Meaning |
|---|---|
| `idle` | RTK Query reports `isUninitialized` and no other lifecycle/result value is present. |
| `submitting` | RTK Query reports `isLoading` and no terminal status. |
| `success` | RTK Query reports `isSuccess`; response data is included when returned. Successful `void` mutations are valid. |
| `error` | RTK Query reports `isError`; its error is normalized once at this boundary. |
| `aborted` | A failed result normalizes to `isAborted`; cancellation is not presented as an ordinary error. |
| `inconsistent` | Lifecycle flags contradict one another, or the result is missing an expected error/lifecycle status. |

The state model deliberately does not include `stale_error` or `refreshing`.
A mutation is an action outcome, not a cached query that the UI should
continue rendering from. A previous mutation response is not treated as the
current action's success when another trigger is submitting.

## Error semantics

The `error` on `error` and `aborted` states is always
`NormalizedApiError`, passed through the existing `normalizeApiError` from
`src/utils/apiError.ts`. The base query normalizes errors before endpoint
hooks; the helper also safely handles unknown/raw RTK Query errors and
preserves already normalized values. It does not parse HTTP or backend
response structures itself.

Semantic classification comes from the existing `ApiErrorKind`; this model
does not define a second taxonomy. It retains both `kind` and backend `code`
and preserves sanitized `fieldErrors` and `requestId` where available.
Consequently a validation error can be mapped to form fields by the existing
`applyApiFieldErrors` helper without duplicating parsing.

## Out of scope

Automatic retry of mutations, notification UX redesign, messaging UX redesign,
logout/session cleanup policy, query state, RTK Query reliability behavior, and
backend behavior remain out of scope. Notification and messaging consumers
retain their existing presentation flows.
