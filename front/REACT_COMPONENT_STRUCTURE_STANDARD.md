# React Component Structure and Hook Ordering Standard

## Status and scope

This is the proposed canonical ordering specification for React components and custom hooks in the frontend. It applies to page components, reusable components, and custom hooks. It is a readability convention, not a prescription to change component boundaries, data flow, or application architecture.

This document does not authorize refactoring. Source files and configuration must remain unchanged until implementation is explicitly approved.

## 1. Canonical order

The numbered order is mandatory as a **relative ordering rule**. A section marked optional is omitted when unused; omission does not change the order of the remaining sections. Dependency and React-semantic exceptions are defined below.

### Module-level order

1. **Imports**
2. **Module-level types and interfaces**
3. **Module-level constants**
4. **Module-level pure helper functions**
5. **Component or custom-hook declaration**
6. **Export**, following that file's established convention

Types, constants, and helper functions are optional. Define a component's prop type before its declaration when it is not shared elsewhere. Keep shared domain types in their current shared locations. Do not move or duplicate them just to satisfy this ordering.

### Inside a component or custom hook

1. **Router hooks and route-derived inputs**
2. **Context and Redux hooks**
3. **Local state and refs**
4. **Data-fetching, mutation, and other external/project hooks**
5. **Derived values and memoized computations**
6. **Effects**
7. **Action functions, event handlers, and async operations**
8. **JSX return** (components only)

Every section inside the component is optional, except the component declaration itself and its return. Custom hooks omit the JSX return and instead return their value/API as the final operation.

Section comments are optional and should be used only when they improve navigation through a long component. Do not add empty headings or boilerplate to small components.

## 2. Hook classification and placement

### React Router hooks

Call hooks such as `useParams`, `useNavigate`, `useSearchParams`, and `useLocation` in section 1 inside the component. Derive route values such as `page`, `id`, or `slug` immediately after the relevant Router hook when later hooks consume those values.

### Context and Redux hooks

Call `useContext`, `useSelector`, and `useDispatch` in section 2. Derive a small value from the returned context/store data immediately after the hook when that value is needed as input to a later hook.

### Local state and refs

- `useState` and `useReducer` belong in section 3.
- `useRef` belongs in section 3, near the state or lifecycle concern it supports.
- Declare state and refs before any hook or derived calculation that consumes them.
- Do not replace state with a ref, or vice versa, merely to fit the ordering.

### RTK Query and other data/mutation hooks

Call RTK Query hooks (including generated query and mutation hooks), and other external or project hooks that provide data, subscriptions, or imperative APIs, in section 4.

Pass the values they depend on from sections 1–3. For example, route parameters must be established before a query hook that uses them; a `skip` condition can then be passed as a hook option. Do not conditionally call the hook.

When query/mutation hooks themselves depend on each other or on another hook result, order them by dependency. This is a dependency-driven exception to internal grouping, not permission to violate hook rules.

### Derived values and memoization

Keep ordinary derived constants in section 5, after their source values and data hooks. Use `useMemo` in this section, after every input it reads is established. Keep a memoized computation near related derived values.

Use `useMemo` only where computation cost or referential stability justifies it. Do not memoize simple property access or inexpensive derivation by default.

Use `useCallback` for a function only when stable identity is required, such as when passing it to a memoized child or using it as an effect dependency. Place it with derived/stable values in section 5 if it must be available to an effect. If used only as a UI action and not by an effect or derived hook, it may be grouped with handlers in section 7. Do not add `useCallback` merely to make every handler memoized.

### Effects

Declare `useEffect` and other lifecycle/synchronization effects in section 6, after the values and callbacks they consume are available. Keep effects close together in their original relative execution order: effect order can matter.

An effect should synchronize with external systems or perform lifecycle-related work, not calculate values that can be derived during render. Keep effect-only functions and logic inside the effect where that makes dependencies clearer. If an effect calls a helper outside itself, declare that helper before the effect and include the correct dependency relationship.

Do not change an effect's dependency array or move it across another effect as part of a structure-only cleanup without reviewing behavior.

### Handlers and async operations

Put user-triggered event handlers, action functions, and async operations in section 7, after the hooks, derived values, and effects. Group related handlers by the UI or action they support. Keep a helper near its consumer when it is local to one action; move it to module scope only if it is pure, independent of component state, and meaningfully reusable or clarifying.

Preserve existing async error handling, mutation semantics, and notification behavior. A function called by an effect is not automatically an event handler: place it before the effect if the effect depends on it, or keep the effect-only logic inline.

### JSX and custom-hook return

For components, all hook calls and component-level declarations precede the JSX return, including loading, error, and empty-state branches. Early returns are allowed only after all hooks have been called unconditionally.

For custom hooks, return the hook API/value after hooks, derived values, effects, and local helper declarations. Keep returned methods and state shape unchanged unless a separate API change is approved.

## 3. Dependency and Rules of Hooks requirements

These rules are mandatory and take priority over visual grouping:

1. **All hooks execute unconditionally at the top level.** Never call a hook inside a condition, loop, callback, nested helper, or after a conditional early return.
2. **Maintain a consistent hook call order across renders.** A hook may use a condition in its arguments/options, such as RTK Query's `skip`, but the hook call itself remains unconditional.
3. **Inputs precede consumers.** Route parameters, context/store values, local state, and refs must be declared before data hooks or computations that consume them.
4. **Hook dependencies precede dependent hooks.** If one custom/data hook needs another hook's result, call the producer first. Follow actual dependencies rather than forcing a superficial category order.
5. **Derived values precede effects and handlers that consume them.**
6. **Stable callbacks precede effects that depend on them.** If a function does not need stable identity, avoid unnecessary memoization.
7. **Preserve effect order and dependency semantics.** Do not change dependencies, effect body behavior, or relative effect execution order during a structural-only move.
8. **Preserve initialization order.** A `const` function or value cannot be accessed before its declaration during initialization. Avoid moving a dependent declaration above its initializer or callback.

### Justified exceptions

- **Dependency ordering:** A hook may move later or earlier within the hook groupings when a real dependency requires it. Record or make that relationship clear in code review.
- **Reducer initialization:** Values and initializers required by `useReducer` must be available before it; keep reducer and initializer definitions at module scope when pure and appropriate.
- **Effect callback dependency:** A `useCallback` required by an effect belongs before that effect, even though callbacks are generally grouped with actions.
- **Conditional UI returns:** Early returns may separate JSX branches, but only after the complete unconditional hook sequence.
- **Existing module/export API:** Keep established default/named exports and existing public symbols. Preserve declaration style if changing it would create unrelated churn.

Exceptions should be narrow and explained in review; they do not waive the Rules of Hooks.

## 4. Import grouping and export policy

Use this import grouping policy:

1. **External packages and platform modules**, including React, React Router, Redux, MUI, and icons.
2. **Project absolute/alias imports**, grouped by project area (shared components/utilities, feature modules, types).
3. **Relative imports** from the same feature/component area.
4. **Side-effect-only imports** such as CSS, positioned consistently at the top or bottom of the groups; preserve execution order when it is meaningful.

Separate groups with a blank line. Use `import type` for type-only imports where appropriate. Keep a type import next to its source module in the applicable group. Avoid duplicate imports from the same module when combining them is clear and does not create unrelated churn.

The current repository does not enforce an import-sort convention, so this is a proposed manual/review policy. Do not rewrite imports mechanically if that could affect side-effect order or create noisy changes.

Retain each file's existing export convention: default function declaration, named declaration plus default export, or named exports. Change exports only for an explicit API reason, not to standardize component ordering.

## 5. Representative TypeScript/React skeleton

```tsx
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { Box } from "@mui/material"

import { useGetItemQuery } from "@/features/example/services/exampleApi"
import type { RootState } from "@/redux/store"
import type { Item } from "@/types/item"

import EmptyState from "./EmptyState"

type ItemPageProps = {
   initialFilter?: string
}

const DEFAULT_PAGE_SIZE = 20

const normalizeFilter = (value: string) => value.trim().toLowerCase()

const ItemPage = ({ initialFilter = "" }: ItemPageProps) => {
   // Router inputs
   const navigate = useNavigate()
   const { itemId } = useParams<{ itemId: string }>()

   // Context/store inputs
   const accountId = useSelector((state: RootState) => state.auth.user?.id)

   // Local state and refs
   const [filter, setFilter] = useState(initialFilter)
   const focusRef = useRef<HTMLInputElement>(null)

   // Data hooks; inputs above are available here
   const query = useGetItemQuery(
      { itemId: itemId ?? "", accountId: accountId ?? "" },
      { skip: !itemId || !accountId }
   )

   // Derived values
   const normalizedFilter = normalizeFilter(filter)
   const items = useMemo(
      () => (query.data?.items ?? []).filter(item =>
         item.name.toLowerCase().includes(normalizedFilter)
      ),
      [normalizedFilter, query.data?.items]
   )

   // Effects
   useEffect(() => {
      if (!query.isLoading) focusRef.current?.focus()
   }, [query.isLoading])

   // Actions
   const handleOpenItem = (item: Item) => {
      navigate(`/items/${item.id}`)
   }

   if (query.isLoading) {
      return <div>Loading…</div>
   }

   return (
      <Box>
         {items.length === 0 ? (
            <EmptyState />
         ) : (
            items.map(item => (
               <button key={item.id} onClick={() => handleOpenItem(item)}>
                  {item.name}
               </button>
            ))
         )}
      </Box>
   )
}

export default ItemPage
```

The example illustrates placement, not a requirement to include comments, every hook type, or every section in each file.

## 6. Acceptable and unacceptable ordering

### Acceptable: route input before query

```tsx
const { id } = useParams()
const query = useGetItemQuery(id ?? "", { skip: !id })
```

### Unacceptable: query before its route input

```tsx
const query = useGetItemQuery(id ?? "", { skip: !id })
const { id } = useParams()
```

The second example references an uninitialized value and violates the dependency order.

### Acceptable: unconditional hook with conditional behavior

```tsx
const query = useGetItemQuery(id ?? "", { skip: !id })

if (!id) return <NotFound />
```

### Unacceptable: hook after an early return

```tsx
if (!id) return <NotFound />

const query = useGetItemQuery(id)
```

This makes the hook sequence conditional across renders.

### Acceptable: memoized callback before dependent effect

```tsx
const syncValue = useCallback(() => {
   externalApi.sync(value)
}, [value])

useEffect(() => {
   syncValue()
}, [syncValue])
```

### Unacceptable: effect before a callback it uses or unnecessary callback memoization

```tsx
useEffect(() => {
   syncValue()
}, [syncValue])

const syncValue = useCallback(() => {
   externalApi.sync(value)
}, [value])
```

This has a temporal-dead-zone ordering issue. Conversely, wrapping every click handler in `useCallback` with no identity-dependent consumer adds noise and is not required by this standard.

### Acceptable: small presentational component without artificial sections

```tsx
type LabelProps = { children: React.ReactNode }

export default function Label({ children }: LabelProps) {
   return <span>{children}</span>
}
```

## 7. Proposed enforcement strategy using existing tooling

Repository-specific findings:

- `eslint.config.js` currently configures `@typescript-eslint/no-unused-vars`; it does not enable React Hooks rules.
- `package.json` already lists `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` as devDependencies. The Hooks plugin is installed but not configured in the current ESLint rules.
- `.prettierrc` and Prettier are present, including `prettier-plugin-tailwindcss`. Prettier formats code and Tailwind classes; it does not reorder hooks, functions, imports, or component logic.
- No import-sorting plugin is listed in `package.json`.

Recommended enforcement:

1. After approval, configure the already-installed React Hooks plugin in ESLint and review its current findings before treating rules as blocking. Prioritize Rules of Hooks and effect dependency validation.
2. Enforce the section ordering through this written convention, code review, and focused examples. Existing tooling does not safely enforce semantic declaration ordering.
3. Continue using Prettier for formatting only. Do not represent Prettier as a logic reordering tool.
4. Decide separately whether import sorting merits a future tool/configuration change. It is not required for this standard and is out of scope without approval.
5. Do not create a general codemod for moving hooks, effects, handlers, or returns. AST-based tools can parse syntax but cannot reliably infer captured state, effect sequencing, data dependencies, or API intent.

## 8. Safe implementation plan for all existing frontend files

Apply the convention in small, reviewable batches after explicit approval:

1. **Baseline and lint setup:** Record current lint/build results. Configure the existing Hooks plugin only if separately approved; inspect all new diagnostics and agree on treatment before making the rule set blocking.
2. **Pilot on simple components/pages:** Start with small presentational components and pages with few hooks (for example `features/user/pages/AboutPage.tsx`, `NotificationsPage.tsx`, and simple feature headers). Validate that the standard adds no boilerplate.
3. **Feature pages with URL/data dependencies:** Review `JobsPage.tsx`, `ApplicationsPage.tsx`, `MessagesPage.tsx`, `CompanyDetailsPage.tsx`, and job detail pages. Preserve route/query dependencies and all early-return placement.
4. **Custom hooks and effects:** Review `features/shared/useConversationMessaging.ts`, `features/admin/authorization/usePermissions.ts`, and effect-heavy profile/form components. Preserve effect order, dependencies, mutation/error handling, and returned hook APIs.
5. **Remaining components by feature:** Apply the same checks across User, Company, Admin, Support, and Auth, followed by shared components, layouts, and routes. Reusable and page components use the same internal ordering; only their needed sections differ.
6. **Per-batch validation:** Review diffs for moved-only changes, run targeted ESLint and relevant tests, then type-check/build. Run full lint/build/tests after completing all batches.

Suggested validation commands when implementation is approved:

```sh
npm run lint --workspace front
npm run build --workspace front
npm test --workspace front
```

Prefer targeted test files where available. For components with route state, effects, or async actions, add or run focused tests/smoke checks that cover those behaviors. Do not change tests or application behavior merely to accommodate stylistic ordering.

## Final rule

The canonical rule is: **imports and module declarations first; then, inside each component or custom hook, establish external inputs and state, call dependent data/custom hooks, derive values, synchronize effects, define actions, and finally return JSX or the hook API.** Resolve real dependencies first while keeping all hooks unconditional and preserving effect semantics. Omit unused sections, retain export conventions, and wait for explicit approval before applying the standard to source files.
