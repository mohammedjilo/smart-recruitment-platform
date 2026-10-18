# Backend Architecture Guidelines

This document defines the permanent backend architecture conventions for this project. It
is based on the current repository structure and the architecture already established by
the completed alignment phases.

This document is intentionally conservative:

- it preserves the current architecture
- it does not introduce new abstraction layers
- it does not force refactors for symmetry alone
- it does not split business logic merely because a file is large
- it does not change route contracts or frontend APIs without explicit reason

---

## 1. Canonical Flow

The project follows this canonical flow:

Route ↓ Controller ↓ Service ↓ Prisma / Data Access

This is the default architecture rule for all new work.

### Route layer

The route layer is responsible for:

- API exposure
- HTTP method and path definition
- middleware chaining
- authentication enforcement
- authorization/permission enforcement
- validation integration

Examples in the current codebase:

- `back/src/routes/user.ts`
- `back/src/routes/company.ts`
- `back/src/routes/job.ts`
- `back/src/routes/application.ts`
- `back/src/routes/admin.ts`
- `back/src/routes/support.ts`

### Controller layer

The controller is responsible for:

- reading request context
- extracting params, query, and body values
- calling the correct service
- translating domain results into HTTP responses

Controllers should not contain business rules. Controllers should not contain
Prisma/database logic. Controllers should not duplicate business policies that belong to
the domain service.

### Service layer

The service layer is responsible for:

- business logic
- domain rules
- ownership checks
- workflow orchestration
- transactions and domain validation
- service-to-service orchestration when the rule belongs to the domain

Examples:

- `back/src/services/application.service.ts`
- `back/src/services/job.service.ts`
- `back/src/services/support.service.ts`
- `back/src/services/user.service.ts`

### Prisma / Data Access

Prisma remains the persistence layer. The architecture does not require a repository
pattern or other abstraction layer.

The project currently uses direct Prisma access in the service layer where the business
logic naturally owns the data boundary.

---

## 2. Domain-First Rule

The core rule is:

Organize business logic primarily around the domain/resource that owns the rule, not
around the actor that happens to call it.

This means the code should primarily answer:

- What domain owns this rule?
- What resource is being operated on?
- What business invariant is being enforced?

It should not begin with:

- This is a user use case, so put it in user service
- This is a company use case, so put it in company service
- This is an admin use case, so put it in admin service

unless the actual business responsibility is genuinely actor-specific.

### Domain/resource vs actor/role

The project uses a hybrid model:

- domain/resource logic is primary
- actor-specific boundaries are allowed when they represent a real use case boundary

Current actors include:

- User
- Company
- Admin

Examples:

- Job rules belong to the Job domain, even when the company or admin is acting on a job
- Application rules belong to the Application domain, even when the user or company is
  involved
- Support rules remain in the Support domain and are actor-aware inside that domain

---

## 3. Hybrid Model

The project intentionally uses a hybrid architecture:

Domain-first + actor-specific boundaries when the use case requires it

This is not a free-for-all to duplicate logic across actor files.

### Applications

Applications are the clearest example of a resource-centric domain with multi-actor usage.

Users:

- submit applications
- list their own applications
- withdraw applications

Companies:

- review applications
- update status

Admins:

- inspect application details
- review administrative data

The canonical business logic remains in:

- `back/src/services/application.service.ts`

This is the correct location for application ownership, status transitions, and business
invariants.

Do not create duplicated User/Company/Admin application business logic.

### Jobs

Job rules remain canonical in:

- `back/src/services/job.service.ts`

A company may expose company-owned job routes, but the company actor must not duplicate
the Job business rules.

This is a valid pattern:

Company actor ↓ Company-use route ↓ Job service ↓ Job business rules

### Admin

Admin is a cross-resource actor layer, not a standalone business domain.

Current organization is intentionally resource-oriented:

- `adminUser`
- `adminCompany`
- `adminJob`
- `adminApplication`
- `adminDashboard`

This is allowed because Admin is acting across multiple domains.

However, Admin-specific services must not duplicate canonical domain rules that already
belong to the User, Company, Job, Application, or Support domains.

### Support

Support remains one cohesive domain.

Different actor flows (user, company, admin) do not justify splitting the Support service
into multiple partially duplicated files.

The current model is valid when:

- the service owns ticket and category workflows
- actor-aware rules remain inside the same domain
- admin-only actions are still protected by permissions and route middleware

---

## 4. Controller Placement Rules

New controller actions should be placed based on the real domain and use case, not on
actor or file symmetry.

Ask these questions:

### Question 1

What domain/resource does this operation belong to?

### Question 2

Who is the actor?

### Question 3

Is this a generic domain use case or an actor-specific use case?

### Question 4

Does splitting it improve clarity without duplicating rules?

### Question 5

Would separation duplicate business logic?

### Decision rule

Prefer meaningful responsibility boundaries over file count symmetry.

Examples of valid patterns:

- a company-owned job mutation route still calls the canonical Job service
- an admin list operation for applications is still backed by the Application domain
  service
- a support route delegates to the central Support service

Examples of invalid patterns:

- one giant admin controller containing unrelated domain logic
- one tiny controller per actor for every domain operation
- a controller that reimplements business rules instead of delegating to the service

---

## 5. Service Placement Rules

The service should own the business rule that is being enforced.

Examples:

Application status rule ↓ `back/src/services/application.service.ts`

Job deadline rule ↓ `back/src/services/job.service.ts`

Support category rule ↓ `back/src/services/support.service.ts`

Rules that are shared across actors must remain in the owning domain service, not copied
into a separate actor service.

### Actor-specific services are fine only when they are orchestration or use-case wrappers

For example:

- admin controller calls a domain service
- a company controller calls the canonical Job service
- a user route calls the user domain service

The admin or company service may orchestrate the operation, but the business rule should
still live in its canonical domain service.

---

## 6. Do Not Duplicate Business Logic

This is a permanent rule.

Never duplicate a business rule merely because another actor needs to use it.

### Incorrect pattern

```
company.service.ts
  updateJobStatus()

job.service.ts
  updateJobStatus()
```

This duplicates the same business rule in two places.

### Preferred pattern

```
Company controller
  ↓
Job service
```

and

```
Admin application operation
  ↓
Application domain logic
```

The same rule should be implemented once in the canonical owning service and consumed by
all relevant actors.

---

## 7. Large Services Rule

File size alone is not a reason to split a service.

A service may remain large when:

- it has strong cohesion
- its functions belong to one domain
- the business ownership is clear
- the responsibilities are understandable
- the service is still easy to navigate

The project currently contains several large but healthy services, including:

- `back/src/services/job.service.ts`
- `back/src/services/application.service.ts`
- `back/src/services/user.service.ts`
- `back/src/services/support.service.ts`

These are considered large but healthy because they are cohesive, domain-owned, and not
fragmented into unrelated responsibilities.

A service should be considered for splitting only when:

- it contains multiple unrelated domains
- it mixes responsibilities with separate ownership
- the workflows are not meaningfully connected
- the business rules are difficult to understand because of unrelated coupling

Do not prescribe arbitrary line-count rules such as:

- split every service over 500 lines
- each service must fit under 300 lines
- every actor must have the same file size

These rules are not aligned with the actual codebase and would create artificial churn.

---

## 8. Admin Boundary Rule

Admin must remain a cross-resource actor layer.

The current organization is the preferred pattern:

- `adminUser`
- `adminCompany`
- `adminJob`
- `adminApplication`
- `adminDashboard`

This is valid because Admin is not a canonical domain in the same sense as Job or
Application.

However:

Admin services must not become copies of domain services.

Use this pattern:

Admin-specific orchestration ↓ canonical domain service

This ensures admin flows use the same business rules and permissions as the underlying
domain.

---

## 9. Route and Frontend Contract Rules

Route changes are external contract changes.

The project distinguishes between:

### Internal controller movement

Example:

- a function moved from one controller file to another
- backend imports updated
- no endpoint path changed

This does not change the frontend API contract.

### Actual route changes

Example:

- `/api/jobs/...` becomes `/api/company/jobs/...`
- path names or methods change
- backend route structure changes

This is an actual API contract change.

When a route changes, the developer must:

1. search backend references
2. search frontend API definitions
3. search RTK Query endpoints
4. search hooks and consumers
5. search direct API calls and hardcoded URLs
6. update all affected consumers
7. search again for stale references
8. run backend + frontend verification

Never leave the backend and frontend on different route contracts.

---

## 10. Route Ownership Pattern

The project uses an actor/resource route structure that communicates context clearly:

- `/api/user`
- `/api/company`
- `/api/job` / `/api/jobs`
- `/api/application`
- `/api/admin`
- `/api/support`

This route placement is useful because it reflects the user-facing ownership boundaries.

However, route placement should not force duplication of domain logic.

A company-owned route may still call the canonical Job service. An admin route may still
call the application domain service. The route is the surface API, not the business
ownership boundary.

---

## 11. Authorization Placement Rule

Authorization should be placed correctly across the stack.

### Route / middleware layer

Responsible for:

- authentication
- role checks
- permission middleware
- endpoint access control

Examples:

- `authMiddleware`
- `requireAdmin`
- `requireCompany`
- `requireUser`
- `permissions` checks in the admin router

### Service layer

Responsible for:

- resource ownership checks
- domain policy
- business-level authorization
- whether an actor may perform an action within the domain

### Controller layer

Responsible for:

- request extraction
- HTTP response shaping
- calling the appropriate service

It should not become the primary authorization engine unless the HTTP concern is genuinely
specific to the request.

Do not duplicate authorization rules in both controller and service without a clear
reason.

---

## 12. Error Handling Integration Rule

The project already has a structured error-handling architecture.

Future work must preserve the project’s current error model:

- `AppError`
- global error handling
- `asyncHandler`
- request ID correlation
- structured logging
- safe serialized error responses
- frontend normalized API-error handling

Rules:

- do not create local error envelopes inside individual controllers
- do not expose raw Prisma or provider details
- do not bypass the global error contract
- do not invent duplicate error layers by domain

This project is intentionally standardized around a centralized error contract and a
shared frontend error normalization layer.

---

## 13. Query and Mutation Reliability Rule

The frontend already has a centralized reliability model for queries and mutations.

Developers must preserve the current behavior:

- failed queries must not be silently converted into empty success data
- loading, empty, refreshing, stale, and error states must remain distinguishable
- authentication refresh must not be casually reset on transient network failures
- mutation retry logic should not be introduced without explicit architectural review
- centralized API normalization should remain the default

This is a preservation rule, not a new abstraction.

---

## 14. Notification Rules

The project already uses a guided notification and presentation model.

Use the current pattern:

- toast for general success/failure feedback where appropriate
- confirmation dialog for destructive or high-impact actions
- inline/form validation for field-level issues
- quiet/no-op behavior only when the domain intentionally expects silent success

Do not introduce new notification systems without architecture review.

---

## 15. AI / Copilot Development Rules

AI-generated code should follow these rules.

Before changing backend architecture, an AI or developer should:

- inspect the current domain before creating a new service
- search for existing canonical logic before introducing new code
- reuse the existing domain service instead of re-implementing logic
- preserve route and frontend contracts
- preserve authorization and error architecture
- avoid splitting files merely because they are large
- avoid merging domains merely to reduce file count
- avoid creating abstractions without a clear need
- search for all consumer references before moving or renaming code

Before making architecture-changing edits, AI should produce a small audit or report when
the change affects:

- controllers
- services
- routes
- frontend API contracts
- major domain ownership boundaries

---

## 16. Decision Matrix

| Situation                                        | Correct action                                                               |
| ------------------------------------------------ | ---------------------------------------------------------------------------- |
| Same business rule is used by User and Company   | Keep the rule in the owning domain service                                   |
| Admin needs a resource-specific use case         | Use an admin-specific controller/service when it is a genuine admin workflow |
| Same Job logic is needed by Company and Admin    | Reuse `job.service.ts`                                                       |
| Service is large but cohesive                    | Do not split for size alone                                                  |
| Service mixes unrelated domains                  | Consider splitting only when the ownership is truly different                |
| Controller contains business logic               | Move the logic into the service                                              |
| Controller file moves but route stays same       | Update imports, no frontend API contract change                              |
| Route path changes                               | Update backend + frontend contract together                                  |
| Support has user/admin flows but one true domain | Keep support unified unless a real boundary emerges                          |
| New abstraction is only hiding minor duplication | Avoid it                                                                     |

---

## 17. Intentional Architectural Exceptions

The project intentionally allows a few patterns that should not be “fixed” later:

- Admin is a cross-resource actor layer.
- Company routes may expose Company-owned Job operations while the canonical Job business
  logic remains in `job.service.ts`.
- Application is a multi-actor resource domain that remains centered on the application
  aggregate.
- Support is intentionally cohesive and actor-aware but not split just because multiple
  actors interact with it.
- Some domain logic is consumed by Admin workflows without being duplicated elsewhere.

These are intentional exceptions; they are part of the architecture, not accidental drift.

---

## 18. Review Checklist

Before merging a backend feature, verify:

- [ ] What domain owns this feature?
- [ ] Is the controller thin?
- [ ] Is the business logic in the owning service?
- [ ] Am I duplicating an existing business rule?
- [ ] Is actor-specific separation genuinely required?
- [ ] Does this change an external API route?
- [ ] If yes, were all frontend consumers updated?
- [ ] Are authorization boundaries preserved?
- [ ] Is the error architecture preserved?
- [ ] Did I avoid unnecessary abstractions?
- [ ] Did I avoid splitting a large but healthy service?
- [ ] Did I run the relevant build/test checks?

---

## 19. Static Architecture Check

A static architecture guard may be useful only if it is simple and reliable.

The project does not need a large, fragile regex-driven framework.

A lightweight static guard is acceptable only when it checks clear, low-risk invariants
such as:

- obvious service-layer imports from Express request/response objects
- direct Prisma access inside controllers
- accidental duplicate legacy imports for the old broad admin structure
- obvious route-fetch mismatches between backend and frontend contract references

A fragile or over-engineered static check should not be added.

If a static guard cannot be implemented without generating false positives, it should not
be added at all.

---

## 20. What This Document Is Not

This document is not a new architecture framework.

It does not introduce:

- decorators
- dependency injection frameworks
- repository abstraction layers
- CQRS patterns
- event sourcing
- domain-driven design boilerplate
- service locators
- abstract base controllers
- abstract base services

It describes the architecture that already works and preserves it.

---

## 21. Summary Rule

The permanent team rule is:

Keep the domain owner responsible for the business rule. Keep the controller thin. Keep
the route as the API boundary. Do not duplicate business logic just because another actor
needs the same rule. Do not split large but cohesive services for arbitrary symmetry. Do
not create route changes without updating all frontend consumers.

This is the architecture convention the repository currently follows.
