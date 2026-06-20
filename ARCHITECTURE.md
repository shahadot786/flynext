# FlyNext — Architecture Reference

> This document describes the architectural design, conventions, data flow, and component responsibilities of the FlyNext application. Read this before making structural changes.

---

## Table of Contents

1. [Tech Stack Overview](#1-tech-stack-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Architectural Quality Attributes & Diagrams](#3-architectural-quality-attributes--diagrams)
4. [Directory Structure](#4-directory-structure)
5. [Routing & Page Map](#5-routing--page-map)
6. [Feature Modules](#6-feature-modules)
7. [State Ownership Model](#7-state-ownership-model)
8. [API Layer](#8-api-layer)
9. [Data Layer](#9-data-layer)
10. [Domain Types & Zod Schemas](#10-domain-types--zod-schemas)
11. [Form Architecture](#11-form-architecture)
12. [Testing Architecture](#12-testing-architecture)
13. [Conventions & Rules](#13-conventions--rules)
14. [Engineering Trade-offs & Decisions](#14-engineering-trade-offs--decisions)

---

## 1. Tech Stack Overview

| Layer              | Technology                        | Version |
| ------------------ | --------------------------------- | ------- |
| Framework          | Next.js App Router                | 16.2.9  |
| UI Library         | React                             | 19.2.4  |
| Language           | TypeScript (`strict: true`)       | ^5      |
| Styling            | Tailwind CSS                      | ^4      |
| Client State       | Zustand                           | ^5      |
| Server/Async State | TanStack Query                    | ^5      |
| Forms              | React Hook Form                   | ^7      |
| Validation         | Zod                               | ^3      |
| Test Runner        | Vitest                            | ^3      |
| Component Testing  | React Testing Library             | ^16     |
| API Mocking        | Mock Service Worker (MSW)         | ^2      |
| Package Manager    | Yarn (Berry)                      | —       |
| Font               | Inter (Google Fonts, `next/font`) | —       |

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser / Client                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Search UI   │  │  Results UI  │  │     Booking UI       │  │
│  │  (feature/   │  │  (feature/   │  │    (feature/         │  │
│  │   search)    │  │   results)   │  │     booking)         │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│         │    URL Search Params (origin, dest, …) │              │
│         │                 │         Zustand bookingStore        │
│         └─────────────────┴──────────────────────┘             │
│                           │                                     │
│                    TanStack Query                               │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │  HTTP fetch
┌───────────────────────────┼─────────────────────────────────────┐
│                     Next.js App Router                          │
│                                                                 │
│        GET /api/flights          POST /api/bookings             │
│        (src/app/api/flights)     (src/app/api/bookings)         │
│                    │                      │                     │
│              src/data/*.json       src/data/flights.json        │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principles

- **Server Components by default.** `"use client"` is added only when hooks, event handlers, or browser APIs are required.
- **No `useEffect` for data fetching.** TanStack Query owns all async data on the client; async Server Components own it on the server.
- **URL is the source of truth for search params.** Never duplicate search state into Zustand or component state.
- **Zustand owns booking session state only** — selected flight, current step, and cross-step form data.

---

## 3. Architectural Quality Attributes & Diagrams

Here are the system diagrams illustrating the core architectural qualities of the FlyNext application:

### ⚡ Performance
This diagram illustrates the optimization and performance benchmarks of FlyNext (caching, skeleton loading, Next.js build optimization):
![Performance Diagram](/diagrams/PERFORMANCE.png)

### 📈 Scalability
This diagram details how the modular features layout and component isolation support scaling the codebase:
![Scalability Diagram](/diagrams/SCALABILITY.png)

### 🛠️ Maintainability
This diagram visualizes the separation of concerns, test automation setup, and strict type derivations from schemas:
![Maintainability Diagram](/diagrams/MAINTAINABILITY.png)

### 👥 Usability
This diagram details the responsive UI layout design, mobile-first headers, interactive navigation, and form validation flows:
![Usability Diagram](/diagrams/USABILITY.png)

---

## 4. Directory Structure

```
flynext/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout (Navbar, Footer, QueryProvider)
│   │   ├── page.tsx                 # Home page — SearchForm
│   │   ├── globals.css              # Global Tailwind base styles
│   │   ├── error.tsx                # Global error boundary
│   │   ├── not-found.tsx            # 404 page
│   │   ├── search/                  # /search route (Results page)
│   │   ├── booking/                 # /booking route (Multi-step booking)
│   │   ├── my-bookings/             # /my-bookings route (History from localStorage)
│   │   └── api/
│   │       ├── flights/route.ts     # GET /api/flights
│   │       └── bookings/route.ts    # POST /api/bookings
│   │
│   ├── features/                    # Vertical feature slices
│   │   ├── search/
│   │   │   ├── components/          # SearchForm, AirportInput, DatePicker, …
│   │   │   └── index.ts             # Public barrel export
│   │   ├── results/
│   │   │   ├── components/          # FlightCard, FilterPanel, SortBar, …
│   │   │   ├── hooks/               # useFlightSearch, useFilterSort
│   │   │   ├── utils/               # filterFlights.ts, sortFlights.ts
│   │   │   └── index.ts
│   │   └── booking/
│   │       ├── components/          # PassengerForm, SeatSelectionForm, …
│   │       ├── schemas/             # bookingSchemas.ts (Zod)
│   │       └── index.ts
│   │
│   ├── shared/                      # Cross-feature primitives
│   │   ├── components/
│   │   │   ├── ui/                  # Button, Input, Select, Badge, Modal, Skeleton, Spinner
│   │   │   └── layout/              # Navbar, Footer
│   │   ├── hooks/                   # useDebounce, useMediaQuery
│   │   ├── providers/               # QueryProvider (TanStack Query setup)
│   │   ├── api/                     # flightService.ts (fetch wrapper + custom errors)
│   │   ├── types/                   # index.ts — all domain types derived from Zod
│   │   └── utils/                   # cn.ts, formatDate.ts, formatDuration.ts, formatPrice.ts
│   │
│   ├── store/
│   │   └── bookingStore.ts          # Zustand store (booking session state only)
│   │
│   └── data/                        # Static mock JSON databases
│       ├── flights.json             # ~230 flight records
│       ├── airports.json
│       ├── countries.json
│       ├── meals.json
│       ├── baggageOptions.json
│       ├── insurance.json
│       ├── seatMap.json
│       ├── popularRoutes.json
│       └── features.json
│
├── __tests__/
│   ├── unit/                        # Pure function & schema tests (Vitest)
│   └── integration/                 # Component workflow tests (RTL + MSW)
│
├── mocks/
│   ├── handlers.ts                  # MSW request handlers
│   └── server.ts                    # MSW Node server (used in tests)
│
└── public/
    ├── airlines/                    # Airline logo assets
    └── screenshots/                 # README screenshots
```

---

## 5. Routing & Page Map

| Route                | File                            | Description                                |
| -------------------- | ------------------------------- | ------------------------------------------ |
| `/`                  | `src/app/page.tsx`              | Home — search hero with `SearchForm`       |
| `/search`            | `src/app/search/`               | Results page — flight list, filters, sort  |
| `/booking`           | `src/app/booking/`              | Multi-step booking flow (5 steps)          |
| `/my-bookings`       | `src/app/my-bookings/`          | Past bookings loaded from `localStorage`   |
| `GET /api/flights`   | `src/app/api/flights/route.ts`  | Serves filtered flight data from JSON      |
| `POST /api/bookings` | `src/app/api/bookings/route.ts` | Creates and returns a booking confirmation |

### Search-to-Booking URL Flow

```
/ (SearchForm)
  → /search?origin=DAC&destination=DXB&date=2026-07-10&cabin=economy&adults=1&…
    → user selects a flight → Zustand.setSelectedFlight()
      → /booking
        → multi-step form (steps 1–5)
          → POST /api/bookings
            → /booking/confirmation
```

---

## 6. Feature Modules

### 5.1 `features/search`

Owns the home-page search experience.

| Component                       | Responsibility                                              |
| ------------------------------- | ----------------------------------------------------------- |
| `SearchForm`                    | Orchestrates search form; reads/writes URL params on submit |
| `AirportInput`                  | Debounced airport autocomplete from `airports.json`         |
| `AirportInputSection`           | Swap origin/destination layout wrapper                      |
| `DatePicker` / `CustomCalendar` | Desktop date selection                                      |
| `DatePickerSection`             | One-way / return date layout                                |
| `MobileDateBottomSheet`         | Mobile-optimized date picker sheet                          |
| `PassengerSelector`             | Adults / children / kids / infants counter                  |
| `MobilePassengerBottomSheet`    | Mobile bottom sheet for passenger counts                    |
| `TripTypeSelector`              | One-way vs. Return toggle                                   |
| `CabinClassPopover`             | Economy / Premium / Business / First selector               |

### 5.2 `features/results`

Owns the `/search` results page.

| Component / Hook / Util     | Responsibility                                               |
| --------------------------- | ------------------------------------------------------------ |
| `FlightCard`                | Full flight details card with expandable itinerary           |
| `FlightCardSkeleton`        | Shimmer placeholder during loading                           |
| `FlightList`                | Renders the sorted, filtered list of `FlightCard`s           |
| `FilterPanel`               | Sidebar: stops, price slider, airline checklist, time ranges |
| `SortBar`                   | Tab-strip for sort options                                   |
| `AirlineComparisonStrip`    | Cheapest-per-airline summary bar                             |
| `ModifySearchTopSheet`      | Inline search modification overlay                           |
| `SessionTimer`              | 30-minute countdown widget                                   |
| `EmptyState` / `ErrorState` | No-results and error UI                                      |
| `useFlightSearch`           | TanStack Query hook — calls `flightService.searchFlights()`  |
| `useFilterSort`             | Derives filtered + sorted flight list from query result      |
| `filterFlights.ts`          | Pure filter logic (stops, price, airline, time)              |
| `sortFlights.ts`            | Pure sort logic (price, duration, departure, stops)          |

### 5.3 `features/booking`

Owns the 5-step multi-page booking flow.

| Step | Component           | Responsibility                                 |
| ---- | ------------------- | ---------------------------------------------- |
| 1    | `PassengerForm`     | Multi-passenger details form (RHF + Zod)       |
| 2    | `AddOnServicesForm` | Meal preferences + travel insurance            |
| 3    | `ExtraBaggageForm`  | Extra luggage weight selection                 |
| 4    | `SeatSelectionForm` | Visual seat grid — occupied, exit row, premium |
| 5    | `ReviewPaymentForm` | Order summary, card inputs, Terms checkbox     |
| —    | `BookingForm`       | Top-level orchestrator; renders current step   |
| —    | `BookingProgress`   | Step indicator / breadcrumb bar                |
| —    | `FlightSummaryCard` | Persistent flight summary panel on the side    |

---

## 7. State Ownership Model

| State                                 | Owner                 | Mechanism                          |
| ------------------------------------- | --------------------- | ---------------------------------- |
| Search params (origin, dest, date, …) | URL                   | `useSearchParams` / `router.push`  |
| Flight results                        | Server cache          | TanStack Query (`useFlightSearch`) |
| Filter & sort options                 | Local component state | `useFilterSort` hook               |
| Selected flight                       | Zustand               | `bookingStore.selectedFlight`      |
| Booking step                          | Zustand               | `bookingStore.bookingStep`         |
| Cross-step form data                  | Zustand               | `bookingStore.formData`            |
| Booking session timer                 | Zustand               | `bookingStore.timerStartedAt`      |
| Completed steps                       | Zustand               | `bookingStore.completedSteps`      |
| Past bookings history                 | `localStorage`        | Saved as `SavedBooking[]`          |
| Form inputs (within a step)           | React Hook Form       | Per-step `useForm` instances       |

> **Rule:** Do not store server-fetched data in Zustand. Do not store booking state in the URL. Never mix these layers.

### Zustand Store Shape (`bookingStore.ts`)

```ts
type BookingState = {
  selectedFlight: Flight | null;
  passengerCount: PassengerCount; // from search
  bookingStep: number; // 1–5
  formData: BookingFormData; // cross-step persistence
  timerStartedAt: number | null; // epoch ms
  completedSteps: number[];
};
```

Actions: `setSelectedFlight`, `nextStep`, `prevStep`, `updatePassengers`, `updateAddOns`, `updateBaggage`, `updateSeats`, `updatePayment`, `completeStep`, `startTimer`, `resetBooking`.

---

## 8. API Layer

### Route Handlers (`src/app/api/`)

| Endpoint        | Method | Input                                                                                                          | Output                  |
| --------------- | ------ | -------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `/api/flights`  | `GET`  | Query params: `origin`, `destination`, `date`, `cabin`, `adults`, `children`, `kids`, `infants`, `returnDate?` | `Flight[]`              |
| `/api/bookings` | `POST` | `BookingRequest` JSON body                                                                                     | `BookingResponse` (201) |

Both routes read data from `src/data/*.json` — **no external database**.

### Client Service (`src/shared/api/flightService.ts`)

```ts
searchFlights(params: FlightSearchParams): Promise<Flight[]>
createBooking(data: BookingRequest):        Promise<BookingResponse>
```

Custom error classes:

- `FlightSearchError(status, message)` — thrown on non-2xx from `/api/flights`
- `BookingError(status, message)` — thrown on non-2xx from `/api/bookings`

TanStack Query (`useFlightSearch`) wraps `searchFlights` and provides automatic retry, loading/error states, and is MSW-interoperable in tests.

---

## 9. Data Layer

All data is stored as static JSON in `src/data/`. No database or external API is used.

| File                  | Contents                           | Used By                          |
| --------------------- | ---------------------------------- | -------------------------------- |
| `flights.json`        | 56 `Flight` records                | `GET /api/flights`, MSW handlers |
| `airports.json`       | Airport codes, names, cities       | `AirportInput` autocomplete      |
| `countries.json`      | Country list for nationality/phone | `PassengerForm`                  |
| `meals.json`          | Meal type options                  | `AddOnServicesForm`              |
| `baggageOptions.json` | Extra baggage weight tiers         | `ExtraBaggageForm`               |
| `insurance.json`      | Insurance plan options             | `AddOnServicesForm`              |
| `seatMap.json`        | Seat grid configuration            | `SeatSelectionForm`              |
| `popularRoutes.json`  | Featured routes on home page       | `page.tsx` hero                  |
| `features.json`       | Marketing feature bullets          | `page.tsx` hero                  |

> **Rule:** Never create data arrays or objects directly inside components. Always create a JSON file in `src/data/` and import it.

---

## 10. Domain Types & Zod Schemas

All domain types live in `src/shared/types/index.ts`. Types are **derived** from Zod schemas using `z.infer<>` — never written manually.

### Core Schemas

```
AirportSchema         → Airport
AirlineSchema         → Airline
MoneySchema           → Money
FlightSegmentSchema   → FlightSegment
FlightSchema          → Flight          (CabinClass: economy | premium-economy | business | first)
PassengerSchema       → Passenger       (PassengerType: adult | child | infant)
PassengerCountSchema  → PassengerCount
MealTypeSchema        → MealType        (standard | vegetarian | vegan | halal | kosher | none)
ContactInfoSchema     → ContactInfo
BookingSchema         → Booking         (BookingStatus: confirmed | pending | cancelled)
BookingRequestSchema  → BookingRequest
BookingResponseSchema → BookingResponse
```

### Booking Form Schemas (`src/features/booking/schemas/bookingSchemas.ts`)

```
PassengerFormSchema → PassengerFormData
AddOnSchema         → AddOnFormData
BaggageSchema       → BaggageFormData
SeatSchema          → SeatFormData
PaymentFormSchema   → PaymentFormData
BookingFormSchema   → BookingFormSchemaData   (composite of all steps)
```

### Filter & Sort Types

```
FlightFilters  — stops, priceRange, airlines, departureTimeRanges, arrivalTimeRanges
SortOption     — price_asc | price_desc | duration_asc | departure_asc | departure_desc | arrival_asc | stops_asc
TimeRange      — early_morning | morning | afternoon | evening
```

---

## 11. Form Architecture

Each booking step has its own `useForm` instance connected to its Zod schema via `zodResolver`. On step completion, data is persisted to Zustand via the appropriate update action.

```
Step renders
  → useForm({ resolver: zodResolver(StepSchema), defaultValues: store.formData.step })
    → user fills fields
      → onSubmit (valid) → store.updateXxx(data) → store.nextStep()
        → next step renders with its own form
```

This ensures:

- Each step validates independently.
- Previous step data is preserved in Zustand if the user navigates back.
- The final `ReviewPaymentForm` assembles the full booking payload from `store.formData`.

---

## 12. Testing Architecture

### Unit Tests (`__tests__/unit/`)

Pure function and schema tests. No rendering, no DOM.

| Test File                | What It Covers                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `filterFlights.test.ts`  | All filter combinations in `filterFlights.ts`                                               |
| `sortFlights.test.ts`    | All sort orders in `sortFlights.ts`                                                         |
| `formatDuration.test.ts` | Duration formatting edge cases                                                              |
| `formatPrice.test.ts`    | Price formatting + currency display                                                         |
| `bookingSchemas.test.ts` | Zod schema validation (valid/invalid inputs & selective Bangladesh phone format validation) |

### Integration Tests (`__tests__/integration/`)

Full component workflow tests using React Testing Library + MSW.

| Test File              | What It Covers                                           |
| ---------------------- | -------------------------------------------------------- |
| `SearchFlow.test.tsx`  | Home page search form submission and URL navigation      |
| `BookingFlow.test.tsx` | Flight selection through multi-step form to confirmation |

### MSW Setup

- `mocks/handlers.ts` — intercepts `GET /api/flights` and `POST /api/bookings`
- `mocks/server.ts` — MSW Node server, started in `vitest.setup.ts`
- Supports `simulate_error` query param to test HTTP error states
- No real API calls are ever made in tests

### Running Tests

```bash
yarn test          # Vitest unit + integration
yarn test:run      # (or vitest run) Runs tests once and exits (CI mode)
```

---

## 13. Conventions & Rules

### Component Rules

- Default to **Server Components**. Add `"use client"` only for hooks, event handlers, or browser APIs.
- No `React.FC` — use plain function declarations with typed props.
- No `useEffect` for data fetching.

### TypeScript Rules

- `strict: true` enforced — no `any`, no `as` casts without a justifying comment.
- All types derived from Zod: `type Foo = z.infer<typeof FooSchema>`.
- All domain types live in `src/shared/types/index.ts`.

### Styling Rules

- Tailwind only. No inline `style={{}}` except for computed dynamic values that Tailwind cannot express.
- Use `cn()` helper (`src/shared/utils/cn.ts`) for conditional class merging.
- No CSS-in-JS (incompatible with Server Components).

### Data Rules

- Never create data arrays/objects directly inside components.
- Always create a JSON file in `src/data/` and import it.

### File Placement Rules

| What                  | Where                                |
| --------------------- | ------------------------------------ |
| New feature component | `src/features/<feature>/components/` |
| Shared UI primitive   | `src/shared/components/ui/`          |
| Layout component      | `src/shared/components/layout/`      |
| Shared hook           | `src/shared/hooks/`                  |
| Shared utility        | `src/shared/utils/`                  |
| Domain type           | `src/shared/types/index.ts`          |
| Feature Zod schema    | `src/features/<feature>/schemas/`    |
| API route             | `src/app/api/<resource>/route.ts`    |
| Mock JSON data        | `src/data/`                          |
| Unit test             | `__tests__/unit/`                    |
| Integration test      | `__tests__/integration/`             |

### Dependency Rules

- Do not install new dependencies without first checking if the existing stack covers the need.
- Do not use Pages Router patterns (`getServerSideProps`, `getStaticProps`).
- Do not add global state for things already owned by URL or TanStack Query.
- Use optional chaining (`?.`) wherever a value could be nullish.

---

## 14. Engineering Trade-offs & Decisions

Every technical decision carries a cost. Below is the defense of the architectural decisions made in FlyNext.

### 🔌 14.1 Fetch API vs. Axios
* **Comparison**: Native `fetch` natively integrates with Next.js request deduplication and caching, while `axios` requires custom adapters and increases bundle size.
* **Defense**: *"We used native `fetch` inside a typed wrapper (`flightService.ts`) to avoid adding unnecessary library bloat while remaining compatible with Next.js's native caching layer."*

### ⚡ 14.2 Next.js App Router vs. Pages Router
* **Comparison**: App Router supports native React Server Components (RSC) and Streaming SSR out of the box, with a steeper learning curve than Pages Router.
* **Defense**: *"App Router allows fetching flight data server-side, eliminating client-side fetch waterfalls. The initial HTML arrives with results embedded, optimizing LCP. The trade-off is a steeper mental model, but it represents the future of Next.js."*

### 🗄️ 14.3 TanStack Query vs. SWR vs. Manual `useEffect`
* **Comparison**: TanStack Query provides rich client caching, automatic garbage collection, and devtools. `SWR` is lighter but less feature-rich; `useEffect` is manual and prone to race conditions.
* **Defense**: *"TanStack Query prevents stale-state and race-condition bugs (where a slow response overwrites a fast one). Intelligent query caching is critical for search apps where searches are frequently repeated."*

### 🧠 14.4 Zustand vs. Redux Toolkit vs. React Context
* **Comparison**: Zustand has minimal boilerplate and selective re-renders. Redux Toolkit is overkill for this scope; React Context triggers full subtree re-renders.
* **Defense**: *"Zustand holds selected flight and cross-step booking state. Context would trigger global re-renders on every passenger keystroke. Redux Toolkit is too heavy for single-engineer developer velocity. Zustand gives Redux's subscription benefits at 10% of the complexity."*

### 📑 14.5 React Hook Form vs. Controlled Inputs vs. Formik
* **Comparison**: React Hook Form uses uncontrolled inputs for zero re-renders on keystrokes. Controlled inputs and Formik re-render the entire form per keystroke.
* **Defense**: *"The booking form contains many fields per passenger. Uncontrolled inputs keep form interaction smooth by avoiding full-component re-renders during text entry. Zod schemas handle validation validation seamlessly."*

### 💎 14.6 Zod vs. Yup for Validation
* **Comparison**: Zod offers native TypeScript type inference. Yup requires manually syncing TypeScript interfaces with schema objects.
* **Defense**: *"Zod provides type-safety for free. `z.infer<typeof Schema>` derives TypeScript types directly from schemas, ensuring a single source of truth and zero duplication."*

### 🌐 14.7 Next.js Mock API Route Handlers vs. Static JSON Import
* **Comparison**: Route Handlers simulate network latency, HTTP errors, and request headers. Importing local JSON files directly is trivial but makes simulating state transitions hard.
* **Defense**: *"Using Next.js Route Handlers (`/api/flights`) maintains a clean separation of concerns. The front-end communicates with mock endpoints exactly as it would with a live backend. In tests, MSW intercepts these network requests seamlessly."*

### 💾 14.8 Static JSON Mock Files vs. Live External Database
* **Comparison**: Mock JSON files eliminate database latency and configuration overhead. Creating a live DB requires DB servers and complex config.
* **Defense**: *"Mock JSON files eliminate database latency and configuration overhead. It creates a deterministic state for MSW integration and unit testing. The route handlers preserve standard API contracts so that an external DB can be integrated seamlessly in the future."*

### 🎨 14.9 Tailwind CSS v4 vs. CSS Modules vs. CSS-in-JS
* **Comparison**: Tailwind CSS has zero runtime overhead and works natively in Server Components. CSS Modules are separate files; CSS-in-JS (styled-components) is incompatible with RSC and has runtime bundle overhead.
* **Defense**: *"Tailwind generates static stylesheets at build time, preserving Server Component compatibility and maximizing LCP. Dynamic class compositions are managed using the `cn()` helper."*

### 📑 14.10 Single-Page Progressive Forms vs. Multi-Page Routing
* **Comparison**: Single-page progressive tabs keep intermediate passenger entries secure and warm in state memory without complex form-state persistence across server page transitions.
* **Defense**: *"Single-page progressive tabs keep intermediate passenger entries secure and warm in state memory without writing guest data to server tables or cookies, bypassing database synchronizations until final checkout."*

### 🪟 14.11 Virtualization vs. Pagination/Render-All for Results
* **Comparison**: Virtualization keeps DOM nodes constant for large lists (100+ items). Pagination splits lists; rendering all works fine for small lists (under 50 items).
* **Defense**: *"With only 30 mock flights, virtualization or complex pagination would be premature optimization. We memoized the filtered flight lists to maintain fast render times. For a real production app with 200+ flights, virtualized lists (react-window) would be introduced."*

