# CLAUDE.md

> Claude-specific instructions. See AGENTS.md for full project rules — everything there applies here too.

## Read First

Before writing any code, read `AGENTS.md`. It defines architecture rules, state ownership, and testing requirements. This file only adds Claude-specific guidance on top of that.

---

## How to Approach Tasks

1. **Understand scope first.** Read the relevant feature folder before touching anything. Check `src/shared/types/index.ts` for existing domain types.
2. **Check what already exists.** Prefer extending a shared component over creating a new one.
3. **Keep changes focused.** One component, one responsibility. Don't refactor unrelated code while implementing a feature.
4. **Verify types compile.** Run `yarn build` or `tsc --noEmit` before finishing.

---

## Common Patterns to Follow

### Server Component with async data

```tsx
// src/app/search/page.tsx
export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const flights = await fetchFlights(searchParams); // direct async call, no useEffect
  return <FlightList initialFlights={flights} />;
}
```

### Client component with TanStack Query

```tsx
"use client";
export function FlightList({ initialFlights }: Props) {
  const { data, isLoading, isError } = useFlightSearch(params, {
    initialData: initialFlights,
  });
  // ...
}
```

### Conditional classes

```tsx
import { cn } from "@/shared/utils/cn";
<button className={cn("btn", isActive && "btn-active", className)} />;
```

### Form field with Zod

```tsx
const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;
const { register, handleSubmit } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

---

## Claude-Specific Reminders

- **Do not hallucinate library APIs.** If unsure how TanStack Query v5 or Zod works, say so rather than guessing.
- **Do not wrap everything in `"use client"`.** Ask: does this need state or event handlers? If no, keep it a Server Component.
- **Do not generate placeholder/lorem ipsum content.** Use realistic mock data consistent with `src/data/`.
- **When asked to "add a feature"**, output: the component(s), the Zod schema (if a form), the type update (if needed), and a note on which existing file to import it from.
