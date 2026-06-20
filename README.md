# FlyNext — Flight Search & Booking

> A premium, fully-responsive flight search and multi-step booking application built with **Next.js 16 App Router**, **React 19**, **TypeScript**, **Tailwind CSS**, **Zustand**, **TanStack Query**, and **React Hook Form + Zod**.

---

## 📸 Screenshots

### 💻 Web View

| Home / Search                          | Results & Filters                                         | Multi-step Booking                                |
| -------------------------------------- | --------------------------------------------------------- | ------------------------------------------------- |
| ![Web Home](/screenshots/web-home.png) | ![Web Search Results](/screenshots/web-search-result.png) | ![Web Booking Form](/screenshots/web-booking.png) |

### 📱 Mobile View

| Home / Search                                | Results & Filters                                               | Multi-step Booking                                      |
| -------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| ![Mobile Home](/screenshots/mobile-home.png) | ![Mobile Search Results](/screenshots/mobile-search-result.png) | ![Mobile Booking Form](/screenshots/mobile-booking.png) |

---

## ✨ Feature Highlights

### Flight Search

- Debounced airport autocomplete (IATA code + city name)
- Passenger breakdown: Adults, Children, Kids, Infants
- One-way and Return trip with a full calendar picker
- Cabin class selector: Economy, Premium Economy, Business, First

### Search Results

- **Airline Comparison Strip** — cheapest fare per airline at a glance
- **Filter Panel** — stops (non-stop / 1 stop / 2+), price range slider, airline checklist, departure & arrival time ranges
- **Sort Bar** — by price, duration, earliest/latest departure, fewest stops
- Skeleton loading states and typed error boundaries
- **30-minute session timer** with a full-viewport expiration modal and 60-second hard-redirect countdown

### Multi-Step Booking Flow (5 Steps)

- **Interactive Step Navigation** — Clickable progress indicators (top progress bar + left sidebar list) allow jumping back and forth to completed or active steps.
- **Selective Bangladesh Phone Validation** — Under Passenger Details, validates phone numbers matching `+880` code against operator-specific criteria (`01XXXXXXXXX` or `1XXXXXXXXX` starting with `3-9`). International phone codes bypass this custom rule.
- **Custom Dial Code Dropdown** — Searchable flag dropdown replacing native select selector, optimized for mobile responsiveness.

| Step | Screen                | What Happens                                                             |
| ---- | --------------------- | ------------------------------------------------------------------------ |
| 1    | **Passenger Details** | Dynamic passenger forms validated with React Hook Form + Zod             |
| 2    | **Add-On Services**   | Meal preference per passenger, travel insurance selection                |
| 3    | **Extra Baggage**     | Additional luggage weight tiers                                          |
| 4    | **Seat Selection**    | Visual seat grid — occupied, exit-row, and premium-priced seats          |
| 5    | **Review & Payment**  | Full itinerary summary, card inputs, Terms agreement, booking submission |

### Post-Booking

- Confirmation page with dynamic e-ticket
- **My Bookings** page — itinerary history persisted in `localStorage`

---

## 🛠️ Tech Stack

| Concern              | Library                              |
| -------------------- | ------------------------------------ |
| Framework            | Next.js 16 App Router (React 19)     |
| Language             | TypeScript 5 (`strict: true`)        |
| Styling              | Tailwind CSS v4                      |
| Client State         | Zustand v5                           |
| Async / Server State | TanStack Query v5                    |
| Forms                | React Hook Form v7                   |
| Validation           | Zod v3                               |
| Testing              | Vitest + React Testing Library + MSW |
| Font                 | Inter via `next/font/google`         |

---

## 🏗️ Project Structure

```
src/
├── app/           # App Router pages, layouts, and API route handlers
├── features/
│   ├── search/    # SearchForm and all sub-components
│   ├── results/   # FlightCard, FilterPanel, SortBar, hooks, utils
│   └── booking/   # 5-step booking forms and schemas
├── shared/
│   ├── components/ui/     # Button, Input, Select, Modal, Badge, Skeleton…
│   ├── components/layout/ # Navbar, Footer
│   ├── hooks/             # useDebounce, useMediaQuery
│   ├── providers/         # TanStack Query provider
│   ├── api/               # flightService.ts (typed fetch wrapper)
│   ├── types/             # All domain types derived from Zod (single source)
│   └── utils/             # cn, formatPrice, formatDuration, formatDate
├── store/         # Zustand bookingStore (booking session only)
└── data/          # Static JSON mock data (flights, airports, meals, …)
```

> See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full design document — data flow diagrams, state ownership table, component responsibilities, API contract, and all architectural conventions.

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v18+
- **Yarn** (Berry)

### Installation

```bash
git clone <repository-url>
cd flynext
yarn install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable                       | Description                                 |
| ------------------------------ | ------------------------------------------- |
| `NEXT_PUBLIC_APP_NAME`         | Application display name                    |
| `NEXT_PUBLIC_APP_URL`          | Base URL (default: `http://localhost:3000`) |
| `NEXT_PUBLIC_DEMO_CARD_NUMBER` | Pre-filled demo card number                 |
| `NEXT_PUBLIC_DEMO_CARD_EXPIRY` | Pre-filled demo card expiry (`MM/YY`)       |
| `NEXT_PUBLIC_DEMO_CARD_CVV`    | Pre-filled demo CVV                         |

### Run Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing

```bash
yarn test        # Vitest — unit + integration (30 tests)
yarn lint        # ESLint
yarn build       # Production build check
```

### Test Coverage

| Type        | Runner    | What's Covered                                                               |
| ----------- | --------- | ---------------------------------------------------------------------------- |
| Unit        | Vitest    | `filterFlights`, `sortFlights`, `formatPrice`, `formatDuration`, Zod schemas |
| Integration | RTL + MSW | Search form → URL nav, full 5-step booking flow                              |

All tests use **MSW** to intercept `GET /api/flights` and `POST /api/bookings` — no real network calls.

---

## 🔄 State Architecture (Summary)

| State                                               | Where It Lives           |
| --------------------------------------------------- | ------------------------ |
| Search params                                       | URL (`useSearchParams`)  |
| Flight results                                      | TanStack Query cache     |
| Filter/sort options                                 | Local component state    |
| Selected flight, booking step, cross-step form data | Zustand (`bookingStore`) |
| Submitted bookings history                          | `localStorage`           |
| Step form inputs                                    | React Hook Form          |

---

## ⏱️ Session Timer Logic

1. A **30-minute timer** starts when the user lands on the results page.
2. The countdown is displayed in the filter sidebar (desktop) and as a sticky header badge (mobile).
3. On expiry, a **full-viewport modal** locks all controls.
4. A **60-second hard-redirect countdown** then clears all Zustand booking state and sends the user back to the home page.

---

## 📄 License

[MIT](./LICENSE)
