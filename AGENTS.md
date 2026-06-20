# AGENTS.md

> Rules for all AI coding agents working on this Next.js 16 App Router project.

## Commands

```bash
yarn dev          # start dev server
yarn build        # production build
yarn lint         # ESLint check
yarn test         # Vitest unit tests
yarn test:e2e     # Playwright E2E tests
```

Always run `yarn lint` and `yarn build` before considering a task complete.

---

## Project Structure

```
src/
├── app/          # Routes, layouts, API route handlers
├── features/     # search | results | booking — colocated components, hooks, utils
├── shared/       # Reusable UI primitives, hooks, utils, domain types
├── store/        # Zustand (bookingStore.ts only)
└── data/         # Mock JSON data
└── data/         # Mock JSON data
```

- **New components** → `src/features/<feature>/components/`
- **Shared UI primitives** → `src/shared/components/ui/`
- **Domain types** → `src/shared/types/index.ts`
- **Never** put business logic in `src/app/` pages — keep pages thin.

---

## Architecture Rules

### Server vs Client Components

- Default to **Server Components**. Add `"use client"` only when you need hooks, event handlers, or browser APIs.
- Never use `useEffect` for data fetching — use TanStack Query on the client or async Server Components on the server.

### State Ownership

| State                         | Owner                    |
| ----------------------------- | ------------------------ |
| Search params                 | URL (`useSearchParams`)  |
| Flight results                | TanStack Query           |
| Selected flight, booking step | Zustand (`bookingStore`) |
| Form inputs                   | React Hook Form          |

Do not mix these. Do not store server-fetched data in Zustand.

### TypeScript

- `strict: true` is enforced. No `any`. No `as` casts without a comment explaining why.
- Derive types from Zod schemas: `type Foo = z.infer<typeof FooSchema>`.
- All domain types live in `src/shared/types/index.ts`.

### Styling

- Tailwind only. No inline `style={{}}` unless computing dynamic values impossible in Tailwind.
- Use the `cn()` helper (`src/shared/utils/cn.ts`) for conditional classes.
- Never use CSS-in-JS (incompatible with Server Components).

### Forms

- All forms use **React Hook Form** + **Zod** (`zodResolver`).
- Schemas live in `src/features/booking/schemas/bookingSchemas.ts`.

### Data Fetching

- Client-side: TanStack Query. Configure `staleTime` and `gcTime` explicitly.
- API routes: `src/app/api/`. Return typed responses. Validate input with Zod.
- Use `next/image` for all images.

---

## Testing

- **Unit**: Vitest — pure functions in `utils/` and Zod schemas.
- **Integration**: React Testing Library + MSW — component workflows and form flows.
- **E2E**: Playwright — critical path: Search → Select → Book → Confirm.

Mock handlers are in `mocks/handlers.ts`. Do not make real API calls in tests.

---

## Do Not

- Do not use Pages Router patterns (`getServerSideProps`, `getStaticProps`).
- Do not use `React.FC` — use plain function declarations with typed props.
- Do not add global state for things already owned by URL or TanStack Query.
- Do not install new dependencies without checking if the existing stack covers the need.
- Do not create any data array or object directly to the components, create json file in the src/data then use it.
- Always use optional chaining where it should be need.
