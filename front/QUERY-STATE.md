# Frontend Semantic Query State

## Responsibility

```text
RTK Query lifecycle and cache
          ↓
getQueryState(rawState, options)
          ↓
SemanticQueryState<TData>
          ↓
UI decides presentation (future migration)
```

RTK Query remains the sole owner of request lifecycle and cached data. This
utility derives a typed interpretation on demand; it does not create a second
Redux store, hook lifecycle, or UI policy. It is generic over response data and
does not depend on tables, stats, components, or presentation.

## Semantic states

`getQueryState<TData>` in `src/utils/queryState.ts` returns this discriminated
union:

```ts
type SemanticQueryState<TData> =
   | { status: "idle" }
   | { status: "initial_loading" }
   | { status: "success"; data: TData }
   | { status: "empty"; data: TData }
   | { status: "no_results"; data: TData }
   | { status: "refreshing"; data: TData }
   | { status: "error"; error: NormalizedApiError }
   | { status: "stale_error"; data: TData; error: NormalizedApiError }
   | { status: "aborted"; error: NormalizedApiError; data?: TData }
   | {
        status: "inconsistent"
        reason:
           | "uninitialized_with_other_state"
           | "error_missing"
           | "success_without_current_data"
           | "data_without_terminal_or_active_state"
           | "active_request_without_loading_or_fetching"
     }
```

The `inconsistent` branch is intentionally diagnostic. It surfaces impossible
or incomplete lifecycle combinations rather than disguising them as a valid
empty or success state. Normal RTK Query hook snapshots expose all lifecycle
booleans; callers should pass them without inventing local lifecycle state.

## Invariants

| State | Meaning | Required conditions |
| --- | --- | --- |
| `idle` | Not started / skipped / uninitialized | `isUninitialized` and no data or other active/terminal flags |
| `initial_loading` | Waiting for the first usable result for these arguments | Loading or fetching with no current-argument data |
| `success` | Successful non-empty result | Success, current data exists, and collection/custom emptiness predicate is false |
| `empty` | Successful result with no items/data under the supplied emptiness predicate | Success and empty result; no proof of records outside this result is supplied |
| `no_results` | Empty current result despite known records outside the result | Successful empty result and caller explicitly supplies `noResults: true` |
| `refreshing` | A request is active while usable data for current arguments remains available | Loading/fetching and current data exists |
| `error` | Current request failed and there is no usable data for its arguments | Error with no current-argument data |
| `stale_error` | A request failed, but current-argument data is still available | Error and current data exists |
| `aborted` | Request was intentionally cancelled | Normalized error has `isAborted: true`; current data, if present, is retained |
| `inconsistent` | Lifecycle flags/data violate expected combinations | One of the explicit inconsistency reasons in the type |

## Empty versus error

Empty is a successful data state, never an error. A failed request always maps
to `error` or `stale_error` (or `aborted` when the normalized error indicates
cancellation). An empty array does not imply a request failure, and missing
data on a failed request does not imply an empty result.

By default, only an empty array is recognized as an empty collection.
Object-shaped stats or other data can opt into an appropriate predicate:

```ts
getQueryState(queryResult, {
   isEmpty: stats => stats.total === 0
})
```

The predicate is applied only after RTK Query reports success.

## Empty versus no results

The utility does not infer that records exist elsewhere from an empty current
result, previous `data`, or a changed search/filter argument. It returns
`empty` unless the caller can prove that the current search/filter has no
matches while records exist outside that result, then explicitly supplies
`{ noResults: true }`.

That evidence could come from an authoritative unfiltered count plus an
authoritative filtered total, or a local filter applied to a separately known
non-empty source collection. A zero current-page result alone is not enough:
it may be an out-of-range page. The caller must also ensure `isEmpty` describes
the relevant result. No current API-wide guarantee was found that all list
endpoints provide both filtered totals and unfiltered totals, so `no_results`
must not be assumed project-wide.

## Initial loading, refreshing, and stale errors

- No usable data for the current arguments plus an active request is
  `initial_loading`.
- Usable data for the current arguments plus an active request is `refreshing`.
- A failed refetch that leaves usable data for the current arguments is
  `stale_error`; data is retained in the returned state.
- A failed first request is `error`.

The model does not decide whether stale data should remain visible; it reports
that data and the error together so a later UI migration can choose presentation.

## `data` versus `currentData`

RTK Query's `data` may be the latest successful result from a previous argument
set; `currentData` is scoped to the current query arguments. To avoid presenting
old filter, sort, tab, or page data as the current result, the utility treats
`currentData` as authoritative whenever that property is present on the input.
If it is `undefined`, the utility does not fall back to `data`.

When an input deliberately omits the `currentData` property, `data` is treated
as the current data. Generated RTK Query hook results include `currentData`;
pass that property through for argument-sensitive queries.

## Search, filters, tabs, and pagination

Changing arguments with no `currentData` for the new arguments maps to
`initial_loading`, even if the hook's `data` still contains the previous
arguments' result. After the new query succeeds, its own data maps to `success`
or `empty`. This prevents a temporary empty state from being inferred from
stale results.

The model stays query-scoped. It does not introduce separate `loading_next_page`
or `pagination_error` states:

- A new page/argument without current data is `initial_loading`.
- A refetch of the current page with current data is `refreshing`.
- A current page request failure without current page data is `error`.
- If an endpoint retains/merges a data set while fetching, the result is
  `refreshing`; page-specific append/merge semantics remain endpoint-specific.
- A pagination error with retained current data is `stale_error`, not a
  full-page error. UI can preserve existing rows and choose pagination-specific
  feedback later.

The helper cannot infer page totals or whether an empty page is an empty whole
collection. Use authoritative endpoint metadata and explicit options when
available; do not infer it from a single page's array length.

## Abort and normalized errors

The returned `error` is always `NormalizedApiError`, created through the Phase
3 `normalizeApiError` utility. When `isAborted` is true the semantic state is
`aborted`, not `error`, `empty`, or `network`. If current data exists, it is
retained in the `aborted` result.

The utility does not retry, refresh credentials, display messages, or change
cache state. Those behaviors remain in the Phase 4 API reliability layer or
future UI work.

## Multiple queries

Queries remain independent. A page combining data, loading, and errors from
several hooks can call `getQueryState` for each hook and decide how to compose
them. This phase does not add a page-level aggregate state because ownership
and partial-failure behavior differ between pages.

## Phase 6 migration inventory (read-only audit)

The Phase 5 audit found raw query-state interpretation in route guards,
detail/list pages, dashboard stats, tabs, shared tables, message lists,
notification lists, and support management. These are migration candidates;
none were changed in this foundation phase.

### Tables and paginated lists

- Shared data table and pagination: `src/components/common/DataTable.tsx`,
  `src/components/common/CustomPagination.tsx`,
  `src/components/common/PaginationFooter.tsx`.
- Admin tables/lists: `src/features/admin/components/applications/ApplicationsTable.tsx`,
  `src/features/admin/components/companyRequests/CompanyRequestsTable.tsx`,
  `src/features/admin/components/jobs/JobsTable.tsx`,
  `src/features/admin/components/support/SupportTicketsTable.tsx`,
  `src/features/admin/components/users/UsersTable.tsx`,
  `src/features/admin/components/AdminCompanyDetails/JobsStep/JobsStep.tsx`,
  `src/features/admin/components/AdminCompanyDetails/ApplicationsStep/CompanyApplicationsStep.tsx`,
  `src/features/admin/components/jobDetails/ApplicationsStep/ApplicationsStep.tsx`,
  plus admin list pages for applications, companies, jobs, users, company
  requests, and support.
- Company and user lists: company applications, jobs, users, and notifications;
  user applications, jobs, companies, saved jobs, and notifications.
- Shared conversation messages: `src/components/common/ConversationMessageList.tsx`.

### Pages and details

- Admin: `src/features/admin/pages/ApplicationsPage.tsx`,
  `CompaniesPage.tsx`, `CompanyDetailsPage.tsx`, `CompanyRequestsPage.tsx`,
  `JobDetailsPage.tsx`, `JobsPage.tsx`, `SupportPage.tsx`,
  `SupportDashboardPage.tsx`, `SupportTicketDetailsPage.tsx`, `UserDetailsPage.tsx`.
- Company: `src/features/company/pages/ApplicationsPage.tsx`,
  `CandidateProfilePage.tsx`, `CompanyProfilePage.tsx`, `DashboardPage.tsx`,
  `EditJobPage.tsx`, `JobDetailsPage.tsx`, `MessagesPage.tsx`,
  `MyJobsPage.tsx`, `NotificationsPage.tsx`, `UsersPage.tsx`.
- User: `src/features/user/pages/ApplicationsPage.tsx`, `CompaniesPage.tsx`,
  `CompanyDetailsPage.tsx`, `DashboardPage.tsx`, `JobDetailsPage.tsx`,
  `JobsPage.tsx`, `MessagesPage.tsx`, `MyProfilePage.tsx`,
  `NotificationsPage.tsx`, `SavedJobsPage.tsx`.
- Route-level query state: `src/routes/AppRoutes.tsx`,
  `src/routes/guards/AdminGuard.tsx`,
  `src/routes/guards/CompletedProfileGuard.tsx`,
  `src/routes/guards/ProfileCompletionGuard.tsx`.

### Stats and tabs

- Dashboard statistics and recent records:
  `src/features/admin/pages/DashboardPage.tsx`,
  `src/features/company/pages/DashboardPage.tsx`,
  `src/features/user/pages/DashboardPage.tsx`,
  and admin/company dashboard stat/list components.
- Admin company details tabs:
  `src/features/admin/components/AdminCompanyDetails/JobsStep/JobsStep.tsx`
  and `ApplicationsStep/CompanyApplicationsStep.tsx`.
- Admin job detail tabs:
  `src/features/admin/components/jobDetails/ApplicationsStep/ApplicationsStep.tsx`
  and `ApplicationQuestionsStep/ApplicationQuestionsStep.tsx`.

### Search/filter and known empty-state risks

The audit found direct empty-length decisions in list components/pages,
including `src/features/user/pages/SavedJobsPage.tsx`,
`src/features/user/pages/JobsPage.tsx`,
`src/features/user/pages/ApplicationsPage.tsx`,
`src/features/admin/pages/CompaniesPage.tsx`,
`src/features/admin/pages/CompanyRequestsPage.tsx`,
and user/company notification and messages lists. These checks should be
reviewed in Phase 6 to ensure loading/error is resolved before empty is shown
and to avoid labeling filtered results as a truly empty collection.

Several detail pages combine `isError` with missing data, including admin
company/job/application/user details and user/company profile/job details.
Phase 6 should assess whether those errors are initial failures or stale-data
errors and preserve their existing normalized error details.

### Pagination and partial loading

Search/filter/page arguments are passed into list queries; Phase 6 should pass
`currentData` through the state helper and preserve existing pagination
contracts. `ConversationMessageList` has a separate older-message loading
operation alongside its query state; that incremental loading is not the
same as an initial query load and should remain separately modeled.

### Scope limitation

The file list is a migration guide based on the Phase 5 read-only search, not a
claim that every matched use is wrong. Some matches are mutation loading flags,
component props, client-only list state, or ordinary data-length checks rather
than RTK Query lifecycle interpretation. Review each use before migrating it.

## Phase 6A — Tables, lists, and pagination

Phase 6A applies `getQueryState` to the main paginated list consumers in the
admin, company, and user areas, as well as the shared `DataTable` and
`PaginationFooter`.

- Argument-sensitive consumers use `currentData` through `getQueryState`;
  rows and pagination metadata are derived from the resulting current state,
  not from RTK Query's potentially previous-argument `data`.
- `DataTable` renders its existing header-and-row skeleton for
  `initial_loading`, keeps current rows visible during `refreshing`, and
  presents normalized errors with the existing manual retry action where
  provided. `stale_error` retains current rows and reports the failed refresh.
- Successful empty arrays reach empty-state UI. Error, abort, and inconsistent
  states are not converted into empty collections. `no_results` is used only
  where the caller can establish that records exist outside the current result.
- `PaginationFooter` accepts the semantic state and disables navigation only
  during `initial_loading` or `refreshing`; call sites use pagination metadata
  from current query data.
- `DataTable` retains its original loading props for unmigrated detail/tab and
  other out-of-scope consumers.

Migrated areas include admin Applications, Companies, Company Requests, Jobs,
Users, Support, and Admin Management; company Applications, My Jobs, and Users;
and user Applications, Companies, Jobs, and Saved Jobs.

Dashboards and stats-only queries, details/tabs, messages, notifications,
forms, and backend behavior remain outside Phase 6A. The Phase 5 inventory
above remains useful as the list of work deferred to later phases; it is not a
claim that those surfaces were migrated here.

Verification for this phase: `npm run build`, `npm run test:query-state`,
`npm run test:api-errors`, `npm run test:api-reliability`, and ESLint on the
changed frontend files passed. The build retains the existing Vite
`__dirname` and chunk-size warnings.

## Phase 6B — Details, tabs, statistics, dashboards, and guards

Phase 6B applies `getQueryState` to resource detail pages, independently
loaded tabs and lookup queries, statistics, dashboards, and route guards.

- Detail pages render the normalized initial error with a retry action;
  `stale_error` keeps the current-argument data visible and reports the
  refresh failure.
- If an aborted query still has current-argument data, consumers retain that
  data and report the cancellation. An abort without data is not rendered as a
  successful empty result.
- Dashboard statistics and detail-tab statistics are rendered only from a
  successful/current response (or retained current data). Missing query data
  is not replaced by synthetic zero values. Explicit zero values returned by a
  successful API response remain valid.
- Independent lookups in Support and Admin Management keep their own semantic
  states and retry actions; failure to load lookup options does not hide the
  primary ticket/admin result.
- Admin permission and profile-completion guards do not redirect or grant
  access based on a failed/aborted-without-data verification request.
- Existing Skeletons are shown during `initial_loading` for detail resources,
  dashboard data, tabs, and applicable statistics. Query-level APIs that
  return a dashboard as one composite response remain one dependency; this
  phase does not invent per-widget requests or aggregate states.

The implementation covers Admin company/job/user/application and support
details; company/user resource details; Admin company/job detail tabs; the
Admin user professional-profile tab; company-scoped jobs; Admin, Support,
Company, and User dashboards; Support ticket lookup lists; Admin role
options; and the Admin/profile-completion route guards.

Messages, notifications, forms and mutation UX, retry architecture, backend
contracts, Redux/RTK Query reliability, and Phase 7 remain out of scope.
