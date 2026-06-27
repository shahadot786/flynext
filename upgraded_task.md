# FlyNext Production Readiness Audit & Roadmap

This document outlines the incomplete tasks, mock components, and structural enhancements required to upgrade FlyNext from a feature-complete mock prototype to a production-ready web application.

---

## 📋 Table of Contents

1. [API & GDS/NDC Integrations](#1-api--gdsndc-integrations)
2. [Payment & PCI-DSS Compliance](#2-payment--pci-dss-compliance)
3. [Database & State Persistence](#3-database--state-persistence)
4. [Authentication & Account Management](#4-authentication--account-management)
5. [Real-time Inventory & Booking Locks](#5-real-time-inventory--booking-locks)
6. [Notifications & Document Generation](#6-notifications--document-generation)
7. [Baggage, Meals & Seat Map Dynamic Loading](#7-baggage-meals--seat-map-dynamic-loading)
8. [i18n & Currency Localization](#8-i18n--currency-localization)
9. [API Security, Rate Limiting & Middleware](#9-api-security-rate-limiting--middleware)
10. [Observability: Monitoring, Logging & Analytics](#10-observability-monitoring-logging--analytics)
11. [CI/CD & Deployment Optimization](#11-cicd--deployment-optimization)

---

## 1. API & GDS/NDC Integrations

- [ ] **Real-time Flights Data Feed**: 
  - *Current*: `src/app/api/flights/route.ts` queries the static mock file [flights.json](file:///Users/shahadot/Desktop/projects/flynext/src/data/flights.json).
  - *Production*: Replace the mock route with direct integrations to a GDS (Global Distribution System) or NDC (New Distribution Capability) aggregator (e.g., **Amadeus Self-Service APIs**, **Sabre**, **Duffel**, or **Travelport**).
- [ ] **Live Fare & Availability Revalidation**:
  - *Current*: Wiping or expiring state does not check live fares.
  - *Production*: Implement a pre-booking fare re-validation step before opening the payment gate, as airline ticket pricing fluctuates second-by-second.
- [ ] **E-Ticket Booking & Hold API**:
  - *Current*: `/api/bookings` immediately returns a static success code with a randomly generated booking reference.
  - *Production*: Connect to the airline provider booking endpoint to hold the reservation (`PNR` creation) and subsequently issue the ticket once payment is settled.

## 2. Payment & PCI-DSS Compliance

- [ ] **Secure Payment Processor Integration**:
  - *Current*: [ReviewPaymentForm.tsx](file:///Users/shahadot/Desktop/projects/flynext/src/features/booking/components/ReviewPaymentForm.tsx) collects raw card data directly through client forms, which violates basic PCI-DSS guidelines.
  - *Production*: Integrate hosted iframe solutions or secure checkout portals such as **Stripe Elements**, **SSLCommerz**, **bKash**, or **PayPal Checkout**. 
- [ ] **Zero-Storage Credit Card Policy**:
  - *Current*: Forms bind input fields to local react state.
  - *Production*: Enforce tokenization. Raw card details (Card Number, CVV, Expiry Date) should be processed entirely inside the gateway iframe, returning only a secure token to the Next.js server.
- [ ] **Async Payment Webhook Handlers**:
  - *Current*: The client expects a synchronous payment confirmation return.
  - *Production*: Set up `/api/webhooks/stripe` to handle asynchronous confirmations. This guarantees that booking tickets are generated only when the billing service fires a successful charge event.

## 3. Database & State Persistence

- [ ] **Relational Database Integration**:
  - *Current*: Bookings are stored in-memory in Next.js router state and local cache variables.
  - *Production*: Implement **PostgreSQL** or **MySQL** managed databases using **Prisma** or **Drizzle ORM** to persistently store transactions, customer detail templates, and reservation logs.
- [ ] **Distributed Cache for Session & Idempotency**:
  - *Current*: `/api/bookings` route handler stores processed bookings in an in-memory Map which wipes on server rebuilds/restarts.
  - *Production*: Implement **Redis** (e.g., via Upstash or AWS ElastiCache) to store processed idempotency keys and active checkout sessions to handle multi-instance servers without duplicate transaction bugs.
- [ ] **Persistent User Bookings history**:
  - *Current*: `/my-bookings` parses `localStorage` which makes the history device-dependent and easily erasable.
  - *Production*: Read booking records directly from the database linked to the authenticated user ID.

## 4. Authentication & Account Management

- [ ] **Authentication Middleware & Sessions**:
  - *Current*: The profile dropdown in the Navbar is purely visual/mock.
  - *Production*: Implement **NextAuth.js (Auth.js)** or **Clerk** authentication. Configure OAuth connections (Google, Apple) and standard Email Magic Link login routes.
- [ ] **Traveller Profile Auto-fill**:
  - *Current*: No passenger details profile templates are present.
  - *Production*: Store frequent flyer profiles in the database, allowing users to auto-fill Step 1 details (Passenger Form) with a single click.

## 5. Real-time Inventory & Booking Locks

- [ ] **Temporary Inventory Hold (Seat Locking)**:
  - *Current*: Choosing seats has no impact on overall flight inventory.
  - *Production*: Implement a temporary seat lock (e.g., 10-15 minute lease) when a passenger completes Step 4 (Seat Selection). This holds the physical seat on the flight plane during the checkout window to prevent double-booking.
- [ ] **Session Expiry Renewal**:
  - *Current*: The 30-minute timer blocks the page and forces a redirect to the Home page.
  - *Production*: Add a "Keep Booking" option in [SessionExpiredModal.tsx](file:///Users/shahadot/Desktop/projects/flynext/src/shared/components/SessionExpiredModal.tsx) which performs a quick API check to verify if the held seat/fare is still available and renews the GDS ticket lease.

## 6. Notifications & Document Generation

- [ ] **Email/SMS Service Integration**:
  - *Current*: E-tickets are only rendered inside client pages.
  - *Production*: Integrate **Resend** or **SendGrid** for confirmation emails, and **Twilio** for dispatching SMS booking updates to contact numbers.
- [ ] **PDF E-Ticket & Receipt Generator**:
  - *Current*: No physical files are created.
  - *Production*: Implement pdf generation pipelines (e.g. using `@react-pdf/renderer` or server-side Puppeteer) to generate official flight boarding receipts and e-ticket PDFs to attach to user checkout emails.

## 7. Baggage, Meals & Seat Map Dynamic Loading

- [ ] **Segment-Specific Baggage and Meal Options**:
  - *Current*: Loaded from static files [meals.json](file:///Users/shahadot/Desktop/projects/flynext/src/data/meals.json) and [baggageOptions.json](file:///Users/shahadot/Desktop/projects/flynext/src/data/baggageOptions.json).
  - *Production*: Dynamically pull ancillary options (meals, luggage limits, travel insurance tiers) directly from the GDS response for the specific flight segment selected, since constraints differ across airlines.
- [ ] **Dynamic Aircraft Seat Maps**:
  - *Current*: [SeatSelectionForm.tsx](file:///Users/shahadot/Desktop/projects/flynext/src/features/booking/components/SeatSelectionForm.tsx) maps layout coordinates from the static file [seatMap.json](file:///Users/shahadot/Desktop/projects/flynext/src/data/seatMap.json).
  - *Production*: Dynamically load seat mappings based on the specific aircraft model (e.g., Boeing 777-300ER, Airbus A321neo) using live cabin map APIs.
- [ ] **Real Refund & Cancellation Rules Display**:
  - *Current*: The "Rules" and "Refund" tabs inside [FlightCard.tsx](file:///Users/shahadot/Desktop/projects/flynext/src/features/results/components/FlightCard.tsx) display static placeholder summaries.
  - *Production*: Dynamically parse and print the exact fare rules, check-in requirements, and cancellation fee policies provided by the airline's GDS response.

## 8. i18n & Currency Localization

- [ ] **Multi-Currency Pricing Engines**:
  - *Current*: Prices are formatted exclusively in BDT (`৳`) via the custom helper [formatPrice.ts](file:///Users/shahadot/Desktop/projects/flynext/src/shared/utils/formatPrice.ts).
  - *Production*: Integrate currency converter APIs (e.g. OpenExchangeRates) to display dynamically adjusted pricing for international customers (USD, EUR, GBP, AED) based on geolocated IP detection.
- [ ] **i18n Translation Setup**:
  - *Current*: English UI labels are hardcoded.
  - *Production*: Integrate **next-intl** or **react-i18next** to localize UI text layers into standard target languages (English, Bengali, Arabic).

## 9. API Security, Rate Limiting & Middleware

- [ ] **Edge Rate Limiting**:
  - *Current*: Route handlers have no middleware checks, leaving them vulnerable to automated price scrapers.
  - *Production*: Implement **Vercel Edge Middleware** or Upstash Rate Limiting to prevent scraping bots and spam calls on `/api/flights` and `/api/bookings`.
- [ ] **HTTP Security Headers Configuration**:
  - *Current*: Next.js default config.
  - *Production*: Configure strict headers inside `next.config.ts`, including Content Security Policy (CSP), Strict-Transport-Security (HSTS), X-Content-Type-Options, and X-Frame-Options to mitigate XSS and clickjacking.

## 10. Observability: Monitoring, Logging & Analytics

- [ ] **Real-time Error Tracking (Sentry)**:
  - *Current*: Uncaught exceptions trigger Next.js error fallback bounds.
  - *Production*: Add **Sentry** SDKs to the Next.js runtime. This allows catching client-side React rendering exceptions and serverless route execution failures.
- [ ] **Structured Logging & Telemetry**:
  - *Current*: console logs are used.
  - *Production*: Setup structured logger tools (e.g. **Pino** or **Winston**) and ship transaction/search telemetry data to aggregators like **Axiom** or **Datadog** for auditing booking issues.
- [ ] **Web Analytics & Funnel Tracking**:
  - *Current*: No tracking enabled.
  - *Production*: Setup Google Tag Manager or Vercel Web Analytics to track the search-to-booking conversion funnel and detect drop-off steps.

## 11. CI/CD & Deployment Optimization

- [ ] **Production Environment Variables Verification**:
  - *Current*: Only `.env.example` and `.env.local` files exist.
  - *Production*: Configure production hosting keys (GDS API credentials, Database connection strings, Mail services, Analytics tags) in the deployment pipeline.
- [ ] **E2E Automation Testing Pipeline Integration**:
  - *Current*: Playwright tests are configured locally.
  - *Production*: Integrate playwright tests into the GitHub Actions CI/CD flow, blocking branches from merging to `master` if any critical path (Search -> Select -> Checkout -> Pay -> Confirm) fails.
