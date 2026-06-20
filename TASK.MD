# Task

Home (Search Form)
│
▼ [user submits search — URL updated with params]
Search Results (/search?origin=DAC&dest=DXB&date=...)
│
├── Filter Panel (sidebar) ← client-side, instant
├── Sort Bar ← client-side, instant
└── Flight List ← server-rendered initially
│
▼ [user clicks Select]
Flight Review (/booking?flightId=...)
│
▼ [user clicks Continue]
Passenger Details (Step 1 of booking)
│
▼
Contact & Payment (Step 2)- (use demo card)
│
▼ [user submits]
Booking Confirmation (/booking/confirmation/BK-12345)

---

## 2. Tech Stack Decisions

### Next.js 16 (App Router)

**Chosen because:**

- Server Components eliminate client-side data-fetch waterfalls. Initial flight results are embedded in the HTML before JavaScript loads.
- Streaming SSR allows the page shell to appear instantly while data loads.
- File-system routing with layouts is perfect for the multi-step booking flow (each step shares a booking layout with a progress bar).
- Built-in API Route Handlers allow a realistic mock API without a separate server.

**Rejected alternative — Vite + React SPA:**
Would require all data fetching client-side. Worse initial load performance. No SSR for SEO (flight result pages benefit from being indexable).

**Rejected alternative — Next.js Pages Router:**
Pages Router requires all server data fetching to happen in `getServerSideProps` at the page level. App Router allows async data fetching in any Server Component, enabling a more granular and composable approach.

### TypeScript (strict mode)

**Chosen because:**

- Domain modeling: the `Flight`, `Booking`, `Passenger` types are the source of truth across the entire app. If the data shape changes, TypeScript surfaces every affected file at compile time.
- Discriminated unions for async state eliminate the `isLoading && !isError && data` pattern.
- Zod schemas can infer TypeScript types — one schema is both the runtime validator and the compile-time type.

**`tsconfig.json` strict settings used:**

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}
```

### TanStack Query v5

**Chosen because:**

- Manages the full async state lifecycle (loading, success, error, refetching) without manual `useEffect` + `useState` combinations.
- Intelligent caching: repeat searches within 5 minutes use cached data — no unnecessary network requests.
- Background refetching: when user returns to the tab, stale data is silently updated.
- Race condition prevention: if two searches overlap, only the latest response is used.
- DevTools for debugging cache state during development.

**Rejected alternative — SWR:**
Good library, but TanStack Query has better TypeScript generics, more powerful cache invalidation, and `useInfiniteQuery` for future pagination.

**Rejected alternative — manual `useEffect`:**
Requires manual race condition handling, loading state management, and error state management. Too much boilerplate, too many edge cases.

### Zustand

**Chosen for global client state because:**

- The selected flight must persist from the results page through the multi-step booking flow. Prop drilling through 3+ route boundaries is not maintainable.
- Context API would cause the entire app to re-render when any booking state changes. Zustand uses subscriptions — only components that read a specific piece of state re-render when it changes.
- Minimal boilerplate. The entire store is defined in under 40 lines.

**What Zustand manages:**

- `selectedFlight: Flight | null` — the flight the user chose
- `passengerCount: PassengerCount` — adults/children/infants from search
- `bookingStep: number` — current step in booking flow

**What Zustand does NOT manage:**

- Search params (URL owns this)
- Flight results (TanStack Query owns this)
- Form inputs (React Hook Form owns this)

### React Hook Form + Zod

**Chosen because:**

- The booking form has 6+ fields per passenger, times up to 9 passengers. Controlled inputs re-render on every keystroke. React Hook Form uses uncontrolled inputs — the DOM holds the value, not React state.
- Zod schemas define validation rules and TypeScript types in one place:

```tsx
const PassengerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().refine(isValidDate, "Invalid date"),
  passportNumber: z.string().optional(),
});

type Passenger = z.infer<typeof PassengerSchema>; // type is derived from schema
```

### Tailwind CSS

**Chosen because:**

- Zero runtime. Works with Server Components (CSS-in-JS with React context does not).
- Styles are collocated with components — deleting a component deletes its styles.
- Design tokens in `tailwind.config.ts` enforce consistency across the app.

**Pattern used for dynamic classes:**

```tsx
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// cn() merges Tailwind classes, resolving conflicts correctly
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

---

## 3. Folder Structure

```
flight-search/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout: fonts, providers, nav
│   │   ├── page.tsx                  # Home: search form (server component shell)
│   │   ├── search/
│   │   │   └── page.tsx              # Results page (reads URL params server-side)
│   │   ├── booking/
│   │   │   ├── layout.tsx            # Booking layout: progress bar
│   │   │   ├── page.tsx              # Flight review / booking form
│   │   │   └── confirmation/
│   │   │       └── [bookingId]/
│   │   │           └── page.tsx      # Confirmation screen
│   │   └── api/
│   │       ├── flights/
│   │       │   └── route.ts          # GET /api/flights — mock flight search
│   │       └── bookings/
│   │           └── route.ts          # POST /api/bookings — mock booking
│   │
│   ├── features/
│   │   ├── search/                   # Everything related to searching
│   │   │   ├── components/
│   │   │   │   ├── SearchForm.tsx    # Origin, destination, date, passengers
│   │   │   │   ├── AirportInput.tsx  # Autocomplete airport selector
│   │   │   │   ├── DatePicker.tsx    # Departure date selector
│   │   │   │   └── PassengerSelector.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useSearchParams.ts # Reads/writes URL search params
│   │   │   └── index.ts              # Public exports
│   │   │
│   │   ├── results/                  # Flight results display
│   │   │   ├── components/
│   │   │   │   ├── FlightList.tsx    # List of flight cards
│   │   │   │   ├── FlightCard.tsx    # Individual flight display
│   │   │   │   ├── FlightCardSkeleton.tsx
│   │   │   │   ├── FilterPanel.tsx   # Stops, price, airline filters
│   │   │   │   ├── SortBar.tsx       # Sort by price/duration/departure
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   └── ErrorState.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useFlightSearch.ts  # TanStack Query wrapper
│   │   │   │   └── useFilterSort.ts    # Filter + sort logic
│   │   │   ├── utils/
│   │   │   │   ├── filterFlights.ts    # Pure filter functions
│   │   │   │   └── sortFlights.ts      # Pure sort functions
│   │   │   └── index.ts
│   │   │
│   │   └── booking/                  # Booking flow
│   │       ├── components/
│   │       │   ├── FlightSummary.tsx       # Review flight before booking
│   │       │   ├── BookingForm.tsx         # Multi-step form shell
│   │       │   ├── PassengerForm.tsx       # Per-passenger fields
│   │       │   ├── ContactForm.tsx         # Email, phone
│   │       │   ├── PaymentForm.tsx         # Mock payment
│   │       │   ├── BookingProgress.tsx     # Step indicator
│   │       │   └── BookingConfirmation.tsx # Success screen
│   │       ├── hooks/
│   │       │   └── useBooking.ts       # Booking mutation (TanStack Query)
│   │       ├── schemas/
│   │       │   └── bookingSchemas.ts   # Zod schemas for all forms
│   │       └── index.ts
│   │
│   ├── shared/
│   │   ├── components/               # Reusable UI primitives
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   └── layout/
│   │   │       ├── Navbar.tsx
│   │   │       └── Footer.tsx
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   └── useMediaQuery.ts
│   │   ├── utils/
│   │   │   ├── formatPrice.ts        # BDT 32,500 formatting
│   │   │   ├── formatDuration.ts     # 145min → "2h 25m"
│   │   │   ├── formatDate.ts
│   │   │   └── cn.ts                 # clsx + twMerge helper
│   │   ├── types/
│   │   │   └── index.ts              # All domain types: Flight, Booking, etc.
│   │   └── api/
│   │       └── flightService.ts      # API client functions
│   │
│   ├── store/
│   │   └── bookingStore.ts           # Zustand store
│   │
│   └── data/
│       └── flights.json              # 30+ mock flights
│
├── public/
│   └── airlines/                     # Airline logo SVGs
│
├── __tests__/                        # Co-located with features (or here)
│   ├── unit/
│   │   ├── filterFlights.test.ts
│   │   └── sortFlights.test.ts
│   └── integration/
│       ├── SearchForm.test.tsx
│       └── BookingFlow.test.tsx
│
├── mocks/
│   ├── handlers.ts                   # MSW request handlers
│   └── server.ts                     # MSW server setup
│
├── README.md
├── ARCHITECTURE.md                   # This file
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## 4. State Management Architecture

### State Ownership Map

```
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION STATE                     │
├──────────────┬──────────────┬──────────────┬────────────┤
│   URL Params  │ TanStack Q  │   Zustand    │  RHF       │
│  (Router)     │ (Server St) │  (Global UI) │  (Forms)   │
├──────────────┼──────────────┼──────────────┼────────────┤
│ origin        │ flights[]   │ selected-    │ passenger  │
│ destination   │ booking{}   │ Flight       │ fields     │
│ date          │             │ passenger-   │ contact    │
│ passengers    │             │ Count        │ fields     │
│ filters       │             │ bookingStep  │ payment    │
│ sortBy        │             │              │ fields     │
└──────────────┴──────────────┴──────────────┴────────────┘
                                   │
                              useState
                         (modal open, accordion,
                          tooltip — local only)
```

### Data Flow Diagram

```
User types search query
        │
        ▼
SearchForm updates URL params (router.push)
        │
        ▼
SearchPage (Server Component) reads URL params
        │
        ▼
ResultsClient ('use client') runs useFlightSearch(params)
        │
        ▼
TanStack Query checks cache
        ├── Cache HIT → return immediately
        └── Cache MISS → fetch('/api/flights?...')
                              │
                              ▼
                       API Route Handler
                              │
                              ▼
                       flights.json filtered
                              │
                              ▼
                       Response → TanStack cache
                              │
                              ▼
                       Component re-renders with data

User clicks filter
        │
        ▼
useFilterSort runs (pure JS, no network)
useMemo recomputes filtered list
        │
        ▼
FlightList re-renders with filtered results (instant)

User clicks "Select" on a flight
        │
        ▼
useBookingStore.setSelectedFlight(flight)
router.push('/booking')
        │
        ▼
Booking page reads selectedFlight from Zustand
```

---

## 5. Data Layer

### Mock API Design

The mock API mirrors what a real backend would provide. This means when a real backend is ready, only `flightService.ts` changes — no components change.

**`GET /api/flights`**

```
Query params:
  origin:      string (IATA code, e.g. "DAC")
  destination: string (IATA code, e.g. "DXB")
  date:        string (ISO date, e.g. "2026-07-01")
  adults:      number
  children:    number
  infants:     number
  cabin:       "economy" | "business" | "first"

Response: Flight[]

Error responses:
  400 — missing required params
  503 — simulated downstream failure (for error state testing)
```

**`POST /api/bookings`**

```
Body: {
  flightId:    string,
  passengers:  Passenger[],
  contactInfo: ContactInfo,
  payment:     { cardLast4: string }  // mock only
}

Response: {
  bookingId:   string,   // "BK-2026-XXXXX"
  status:      "confirmed",
  flight:      Flight,
  totalPrice:  Money,
  createdAt:   string
}

Error responses:
  400 — validation failure (missing fields)
  409 — seat no longer available (simulate race condition)
  500 — payment failure (simulate)
```

### Mock Data Strategy

`flights.json` contains 50+ flights across:

- 4 airlines (Biman Bangladesh, Emirates, Qatar Airways, Air Arabia)
- Price range: BDT 28,000 – BDT 180,000
- Stop variations: 0 (non-stop), 1 stop, 2 stops
- Departure time spread: 06:00 – 23:00
- Duration range: 3h 45m – 12h 30m

The API route handler applies real filtering logic against this data, so filter behavior is genuine.

---

## 6. Component Architecture

### Component Classification

Every component in the project falls into one of three tiers:

**Tier 1 — UI Primitives (`shared/components/ui/`)**

- No business logic whatsoever
- Fully controlled via props
- Extensively reusable
- Examples: `Button`, `Input`, `Badge`, `Skeleton`, `Modal`

```tsx
// Button — pure presentational
type ButtonProps = {
  variant: "primary" | "secondary" | "ghost" | "danger" | "warning";
  size: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};
```

**Tier 2 — Feature Components (`features/*/components/`)**

- Composed from Tier 1 primitives
- May contain local `useState` for UI state (accordion open, tooltip)
- Receive domain data via props
- Do not fetch their own data (parent hook does the fetching)

```tsx
// FlightCard — receives data, does not fetch
type FlightCardProps = {
  flight: Flight;
  onSelect: (flight: Flight) => void;
  isHighlighted?: boolean;
};
```

**Tier 3 — Page/Container Components (`app/*/page.tsx`)**

- Orchestrate data fetching and state
- Connect hooks to components
- Server Components by default; use 'use client' only when needed

### Server vs Client Component Decision Tree

```
Does this component...
  ├── use useState, useEffect, or other hooks?
  ├── handle click events, form inputs, or keyboard events?
  ├── use browser APIs (window, localStorage)?
  └── use a library that requires React context?

  YES to any → 'use client'
  NO to all  → Server Component (default — leave as is)
```

### Composition Pattern

Large components are built by composing smaller ones:

```tsx
// ResultsPage orchestrates everything
export default function ResultsClient({ initialFlights }: Props) {
  const { filters, setFilters } = useFilters();
  const { sortOption, setSortOption } = useSort();
  const filteredFlights = useFilterSort(initialFlights, filters, sortOption);

  return (
    <div className="grid grid-cols-[280px_1fr] gap-6">
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        flightCount={filteredFlights.length}
      />
      <div>
        <SortBar
          value={sortOption}
          onChange={setSortOption}
          total={filteredFlights.length}
        />
        {filteredFlights.length === 0 ? (
          <EmptyState
            filters={filters}
            onReset={() => setFilters(defaultFilters)}
          />
        ) : (
          <FlightList flights={filteredFlights} />
        )}
      </div>
    </div>
  );
}
```

---

## 7. Routing & Navigation

### Route Structure

```
/                           Home — search form
/search                     Results (URL holds all search state)
  ?origin=DAC
  &destination=DXB
  &date=2026-07-01
  &adults=1
  &children=0
  &cabin=economy
  &sort=price_asc           Sort state in URL (shareable)
  &stops=0,1                Filter state in URL (shareable)

/booking                    Flight review + booking form
  ?flightId=FL-001          Which flight was selected

/booking/confirmation/[id]  Confirmation screen
  BK-2026-XXXXX             Booking reference
```

### Why Filters Live in the URL

This is a deliberate decision with meaningful trade-offs:

**Benefits:**

- Shareable: user can send a link with filters applied
- Bookmarkable: user can save filtered results
- Browser back/forward works correctly
- Server can render the right filtered state on first load

**Cost:**

- URL updates can trigger unnecessary re-renders if not debounced
- URL length can get long with many filters

**Implementation:**

```tsx
// Debounce price range filter to avoid URL spam while dragging slider
const debouncedPriceRange = useDebounce(priceRange, 500);

useEffect(() => {
  const params = new URLSearchParams(searchParams.toString());
  params.set("minPrice", debouncedPriceRange[0].toString());
  params.set("maxPrice", debouncedPriceRange[1].toString());
  router.replace(`/search?${params.toString()}`, { scroll: false });
}, [debouncedPriceRange]);
```

### Booking Flow Navigation Guard

```tsx
// Prevent direct access to /booking without a selected flight
export default function BookingPage() {
  const { selectedFlight } = useBookingStore();
  const router = useRouter();

  useEffect(() => {
    if (!selectedFlight) {
      router.replace("/"); // Redirect to home if no flight selected
    }
  }, [selectedFlight, router]);

  if (!selectedFlight) return null; // Avoid flash of booking page
  return <BookingFlow flight={selectedFlight} />;
}
```

---

## 8. Form & Validation Architecture

### Multi-Step Form Design

The booking form is a single `useForm` instance that persists across steps. Data is NOT reset between steps.

```tsx
// hooks/useBookingForm.ts
export function useBookingForm(passengerCount: PassengerCount) {
  const schema = buildBookingSchema(passengerCount); // dynamic based on passenger count

  return useForm<BookingFormData>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(passengerCount),
    mode: "onBlur", // Validate when user leaves a field, not on every keystroke
  });
}
```

### Validation Schema

```tsx
// features/booking/schemas/bookingSchemas.ts

const PassengerSchema = z.object({
  type: z.enum(["adult", "child", "infant"]),
  firstName: z
    .string()
    .min(4, "At least 2 characters")
    .max(100, "Too long")
    .regex(/^[a-zA-Z\s-']+$/, "Letters only"),
  lastName: z.string().min(4, "At least 2 characters").max(50, "Too long"),
  dateOfBirth: z
    .string()
    .refine(isValidDate, "Invalid date")
    .refine(isNotFuture, "Date of birth cannot be in the future"),
  passportNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Z0-9]{6,9}$/.test(val),
      "Invalid passport format",
    ),
  passportExpiry: z
    .string()
    .optional()
    .refine((val) => !val || isFutureDate(val), "Passport must not be expired"),
});

const ContactSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(11, "Phone number too short")
    .regex(/^\+?[0-9\s\-()]+$/, "Invalid phone number"),
});

export function buildBookingSchema(count: PassengerCount) {
  return z.object({
    passengers: z.tuple([
      ...Array(count.adults).fill(PassengerSchema),
      ...Array(count.children).fill(PassengerSchema),
      ...Array(count.infants).fill(PassengerSchema),
    ]),
    contact: ContactSchema,
  });
}
```

### Booking Submission with Idempotency

```tsx
// Prevent double-booking if user clicks submit twice or network retries
export function useBooking() {
  const idempotencyKey = useRef(crypto.randomUUID()); // Generated once per session

  return useMutation({
    mutationFn: (data: BookingRequest) =>
      flightService.createBooking({
        ...data,
        idempotencyKey: idempotencyKey.current,
      }),
    onSuccess: (booking) => {
      router.push(`/booking/confirmation/${booking.id}`);
    },
    onError: (error: BookingError) => {
      if (error.status === 409) {
        // Seat taken — redirect back to search
        toast.error(
          "Sorry, this seat is no longer available. Please select another flight.",
        );
      }
    },
  });
}
```

---

## 9. Error Handling Strategy

### Error Boundary Hierarchy

```
<RootErrorBoundary>          ← Catches catastrophic errors
  <Layout>
    <SearchErrorBoundary>    ← Catches search failures
      <ResultsClient>
        ...
    </SearchErrorBoundary>
    <BookingErrorBoundary>   ← Catches booking failures
      <BookingFlow>
        ...
    </BookingErrorBoundary>
  </Layout>
</RootErrorBoundary>
```

### Error Classification

```tsx
type ErrorSeverity = "recoverable" | "partial" | "fatal";

function classifyError(error: unknown): ErrorSeverity {
  if (error instanceof FlightSearchError) {
    if (error.status === 503) return "recoverable"; // Retry makes sense
    if (error.status >= 500) return "fatal";
    return "recoverable";
  }
  if (error instanceof BookingError) {
    if (error.status === 409) return "recoverable"; // Choose different flight
    return "fatal";
  }
  return "fatal";
}
```

### User-Facing Error Messages

No technical errors are shown to users. Every error maps to a human message:

```tsx
const ERROR_MESSAGES: Record<number, string> = {
  400: "Please check your search and try again.",
  404: "No flights found for this route.",
  503: "Flight search is temporarily unavailable. Please try again in a moment.",
  500: "Something went wrong on our end. We're working on it.",
};
```

No flights found.

Try:

- Different dates
- Removing filters
- Increasing budget

Use this for better results in the UI section.

---

## 10. Performance Strategy

### Rendering Strategy Per Page

| Page                         | Strategy                            | Reason                                      |
| ---------------------------- | ----------------------------------- | ------------------------------------------- |
| `/` (Home)                   | Static (SSG)                        | No dynamic data. Rebuilt only on deploy.    |
| `/search`                    | Server-rendered per request (SSR)   | Reads URL params, fetches relevant flights. |
| `/booking`                   | Client-rendered after initial shell | Depends on Zustand (client state).          |
| `/booking/confirmation/[id]` | Server-rendered                     | Booking data fetched server-side by ID.     |

### Memoization Strategy

```tsx
// 1. Expensive computation — memoize
const filteredFlights = useMemo(
  () => filterAndSort(flights, filters, sortOption),
  [flights, filters, sortOption], // only recomputes when these change
);

// 2. Stable callbacks passed to child components — memoize
const handleSelect = useCallback(
  (flight: Flight) => {
    setSelectedFlight(flight);
    router.push("/booking");
  },
  [router], // setSelectedFlight is stable from Zustand
);

// 3. Pure components receiving stable props — memoize
const FlightCard = memo(function FlightCard({
  flight,
  onSelect,
}: FlightCardProps) {
  // Re-renders only when flight or onSelect reference changes
});
```

**When NOT to memoize:**

- Simple components with cheap renders
- Components that always receive new props
- Memoization has its own cost (memory + comparison)

### Image Optimization

```tsx
// Always use next/image — automatic:
// - WebP conversion (30-40% smaller)
// - Lazy loading (only loads when in viewport)
// - Size optimization (serves correct size for device)
// - Prevents CLS (reserves space before image loads)

<Image
  src={`/airlines/${flight.airline.code}.svg`}
  alt={flight.airline.name}
  width={40}
  height={40}
  priority={index < 3} // Above-fold images load eagerly
/>
```

### TanStack Query Cache Configuration

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
      gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
      retry: 2, // Retry failed requests twice
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000), // Exponential backoff
    },
  },
});
```

---

## 11. Testing Architecture

### Test Pyramid

```
          ┌────────────┐
          │    E2E     │  2–3 critical path tests (Playwright)
          │  Playwright│  Search → Select → Book → Confirm
          ├────────────┤
          │Integration │  ~15 tests (React Testing Library + MSW)
          │  RTL+MSW   │  Component workflows, form submission, error states
          ├────────────┤
          │    Unit    │  ~30 tests (Vitest)
          │   Vitest   │  filterFlights, sortFlights, formatPrice, schemas
          ├────────────┤
          │  Static    │  TypeScript strict + ESLint (free, runs on every save)
          └────────────┘
```

### Unit Test Examples

```tsx
// __tests__/unit/filterFlights.test.ts
describe("filterFlights", () => {
  const mockFlights = generateMockFlights(10);

  describe("stops filter", () => {
    it("returns only non-stop flights when maxStops is 0", () => {
      const result = filterFlights(mockFlights, { maxStops: 0 });
      expect(result.every((f) => f.stops.length === 0)).toBe(true);
    });

    it("returns all flights when maxStops is null (no filter)", () => {
      const result = filterFlights(mockFlights, { maxStops: null });
      expect(result).toHaveLength(mockFlights.length);
    });
  });

  describe("price filter", () => {
    it("filters flights within price range", () => {
      const result = filterFlights(mockFlights, {
        priceRange: [30000, 60000],
      });
      expect(
        result.every((f) => f.price.amount >= 30000 && f.price.amount <= 60000),
      ).toBe(true);
    });
  });

  describe("airline filter", () => {
    it("filters by selected airlines", () => {
      const result = filterFlights(mockFlights, { airlines: ["BG", "EK"] });
      expect(
        result.every((f) => ["BG", "EK"].includes(f.segments[0].airline.code)),
      ).toBe(true);
    });

    it("returns all flights when no airlines selected", () => {
      const result = filterFlights(mockFlights, { airlines: [] });
      expect(result).toHaveLength(mockFlights.length);
    });
  });
});
```

### Integration Test Examples

```tsx
// __tests__/integration/SearchFlow.test.tsx
describe("Flight Search Integration", () => {
  it("displays flight results after search", async () => {
    render(<SearchResultsPage />);

    // Simulate URL params already set (user came from search form)
    // MSW intercepts /api/flights and returns mock data

    expect(
      await screen.findAllByRole("article", { name: /flight/i }),
    ).toHaveLength(5); // MSW returns 5 flights
  });

  it("shows skeleton while loading", () => {
    server.use(
      rest.get(
        "/api/flights",
        (req, res, ctx) => res(ctx.delay("infinite")), // Never resolves
      ),
    );
    render(<SearchResultsPage />);
    expect(screen.getAllByTestId("flight-skeleton")).toHaveLength(5);
  });

  it("shows error state when search fails", async () => {
    server.use(
      rest.get("/api/flights", (req, res, ctx) => res(ctx.status(503))),
    );
    render(<SearchResultsPage />);
    expect(
      await screen.findByText(/temporarily unavailable/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
  });

  it("shows empty state when no flights match filters", async () => {
    server.use(rest.get("/api/flights", (req, res, ctx) => res(ctx.json([]))));
    render(<SearchResultsPage />);
    expect(await screen.findByText(/no flights found/i)).toBeInTheDocument();
  });
});
```

### MSW Setup

```tsx
// mocks/handlers.ts
import { rest } from "msw";
import flightsData from "@/data/flights.json";

export const handlers = [
  rest.get("/api/flights", (req, res, ctx) => {
    const origin = req.url.searchParams.get("origin");
    const destination = req.url.searchParams.get("destination");

    const results = flightsData.filter(
      (f) => f.origin === origin && f.destination === destination,
    );

    return res(
      ctx.delay(300), // Realistic latency in tests
      ctx.json(results),
    );
  }),

  rest.post("/api/bookings", async (req, res, ctx) => {
    const body = await req.json();

    // Validate required fields
    if (!body.flightId || !body.passengers?.length) {
      return res(
        ctx.status(400),
        ctx.json({ message: "Missing required fields" }),
      );
    }

    return res(
      ctx.delay(500),
      ctx.json({
        id: `BK-2026-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        status: "confirmed",
        totalPrice: { amount: 45000, currency: "BDT" },
        createdAt: new Date().toISOString(),
      }),
    );
  }),
];
```

---

## 12. What I Would Do With More Time

Listed in priority order, with rationale:

### High Priority

**1. Real-time price updates**
Use `staleTime: 0` + background polling with TanStack Query. Flight prices change frequently — stale prices lead to booking failures.

**2. Price calendar / flexible dates**
Show a 7-day grid with lowest price per day. Users who find no affordable flights can see adjacent dates instantly. Massive UX improvement, very common in production flight apps.

**3. Proper accessibility audit**
Run axe-core automated checks + manual keyboard-only navigation test. Add skip-to-content link, ensure all interactive elements have proper ARIA attributes.

**4. E2E tests with Playwright**
The critical booking path (search → select → form → confirm) should have an automated E2E test that runs on every PR. 10-15 minutes of setup, saves hours of manual regression testing.

**5. Flight comparison**
Allow user to pin 2–3 flights and compare them side-by-side in a table. Price, duration, baggage, stops, departure time.

**8. Seat selection**
Show a seat map after flight selection. Requires SVG rendering of the aircraft cabin. Complex but expected by users in premium flows.

---
