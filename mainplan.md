# ActiveSports — Comprehensive Technical Audit & Implementation Roadmap

> **Audit Date:** May 11, 2026
> **Current Version:** 0.1.0
> **Stack:** Next.js 16.2.6 (App Router), React 19.2.4, TypeScript 5, Prisma 7.8, PostgreSQL, Upstash Redis, Tailwind CSS 4
> **API Tier:** API-Football Free (100 req/day)
> **Hosting Target:** Vercel

---

## 🩺 Executive Summary

The application has a solid foundation with a well-architected API client (`lib/apifootball.ts`), caching layer (Upstash Redis + in-memory fallback), authentication (NextAuth.js), and core pages for matches, teams, players, and leagues. However, it is **feature-incomplete** for a production-ready sports platform, especially regarding the World Cup 2026 module, odds hub, search, UX polish, and infrastructure hardening. Below is a categorized, prioritized roadmap.

---

## PART 1: CRITICAL / IMMEDIATE

These items represent either **blocking gaps** (routes that exist but are non-functional in key scenarios) or **immediate risk** (API quota exhaustion, zero error recovery).

---

### 1.1 Graceful Error States & Skeleton Loaders

**Problem:** All pages use `Promise.allSettled` with try/catch, but failing API calls result in empty sections with no visual feedback. The `.skeleton` CSS class is defined but **unused anywhere**. There are no loading boundaries for data fetching.

**Location:**
- `app/page.tsx` — silent catch on line 17, renders empty if API fails
- `app/team/[id]/page.tsx` — silent empty arrays on rejection
- `app/player/[id]/page.tsx` — silent empty arrays on rejection
- `app/match/[id]/page.tsx` — silent `[]` on rejection
- `components/ErrorBoundary.tsx` — exists but only handles React render errors, not async data failures

**Recommendation:**
- Implement a reusable `<Skeleton />` component using the existing CSS class
- Build a `<AsyncBoundary>` wrapper that shows skeletons while data resolves and a `<FallbackState icon="..." message="..." />` for failures
- Apply to all dynamic sections (standings, squad lists, stats grids, fixtures lists)

**Tech Stack:** React 19 Server Components + Client Components, Tailwind CSS
**Challenge:** Distinguishing "loading" from "empty" from "error" states cleanly without over-abstracting
**Definition of Done:** Every section on every page shows a skeleton on fetch, a fallback with retry on error, and a "No data" state when the API returns empty

---

### 1.2 API Rate Limit Hardening

**Problem:** The free API tier allows **100 requests/day**. The current middleware.ts rate-limits at 100/day per IP but does this at the middleware level only — it does not protect against internal server-side calls (e.g., SSR data fetching in page components). An admin page refresh could consume 5+ requests. One burst of 20 visitors could exhaust the daily quota.

**Current Implementation:**
- `middleware.ts` — global sliding window of 100/1d for `/api/*` routes only (line 16-18)
- `lib/apifootball.ts` — caching helps but every cache miss burns a quota slot
- No prioritization: standings fetches compete with static league metadata

**Recommendation:**
- Implement a **request prioritization queue**: static data (leagues, countries) gets the longest TTL and lowest priority
- Add **Upstash Redis rate-limit headers** to all server component data fetches (not just middleware)
- Build a **quota budget system**: reserve `N` requests for live data, `M` for standings, `K` for player pages
- Add **stale-while-revalidate** pattern via Next.js `revalidate` + cache tags

**Tech Stack:** @upstash/ratelimit 2.x, @upstash/redis 1.x, Next.js incremental cache tags
**Challenge:** Balancing freshness vs. quota preservation; implementing per-endpoint TTL priorities
**Definition of Done:** Application never exceeds 90 req/day under normal user flows; lowest-priority fetches gracefully degrade to stale cache when quota is tight

---

### 1.3 Admin Dashboard — Real-Time Quota Monitoring & Rate-Limit Controls

**Problem:** The admin page (`app/admin/page.tsx`) shows API usage from the `/status` endpoint but:
- No rate-limit override controls (e.g., temporarily boosting live match limits)
- No per-endpoint quota breakdown
- No alerts or notifications when quota is critically low
- No history/tracking of daily usage patterns

**Current Implementation:**
- `app/admin/page.tsx` — reads `status.requests.current` and `status.requests.limit_day`
- Rate-limiter in `middleware.ts` is opaque to the admin panel

**Recommendation:**
- Store hourly usage snapshots in a new `ApiUsageLog` table (Prisma model)
- Build a real-time dashboard panel showing: today's usage per endpoint, cache hit/miss ratio, rate-limit throttle events
- Add controls to: temporarily override rate-limit window, enable "emergency mode" (serve only cached data), whitelist IPs
- Webhook notification when usage exceeds configurable thresholds

**Tech Stack:** Prisma 7.x, PostgreSQL, next-auth for admin role, Recharts or Tremor for charts
**Challenge:** Accurately tracking usage without burning API quota to do so; admin authentication/authorization
**Definition of Done:** Admin can see real-time usage across all endpoints, receive alerts at 75%/90% quota thresholds, and manually adjust rate-limit policies

---

## PART 2: FEATURE GROWTH

These items are **missing features** that significantly impact user experience and site completeness.

---

### 2.1 World Cup 2026 Module — Knockout Bracket

**Problem:** The `/world-cup` page (line 199-209) shows a "What to Expect" card that *promises* a knockout bracket, but no bracket component exists. The page only renders group standings (when started) and a countdown (before start).

**Current Implementation:**
- `app/world-cup/page.tsx` — groups + top scorers only
- No bracket data models, no bracket rendering component

**Recommendation:**
- Build a `<KnockoutBracket>` component that renders a 48-team bracket (Round of 32 → Round of 16 → Quarter-finals → Semi-finals → Final)
- Data source: fixtures from `getFixturesByLeague(WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON)` — parse round names to determine bracket position
- Support auto-advancing winners based on fixture results
- Include third-place playoff match, match date/time display, and team flags/logos
- Mobile-responsive: collapse to vertical bracket on small screens

**Tech Stack:** React 19, Tailwind CSS, API-Football fixtures data
**Challenge:** Parsing fixture round names into a deterministic bracket layout; handling 48-team format with group winners advancing
**Definition of Done:** Full knockout bracket renders on `/world-cup` when tournament starts; winners auto-advance; responsive on all screen sizes

---

### 2.2 World Cup 2026 Module — Dedicated Nation Hubs (48 Team Pages)

**Problem:** No `/world-cup/team/[id]` routes exist. Users cannot browse individual national team profiles with squad, form, group standing, and projected XI.

**Current Implementation:**
- `app/team/[id]/page.tsx` — exists for club teams but no World Cup specialization
- `/world-cup` page shows group tables but doesn't link to individual nation pages

**Recommendation:**
- Create `app/world-cup/team/[id]/page.tsx` — a specialized page for national teams showing:
  - Flag, nation name, FIFA ranking, group assignment
  - Squad with positions and player links
  - Group standing (the team's position in their group)
  - Match schedule (group stage + potential knockout path)
  - Recent form (last 5 matches)
  - Top scorer for the nation in the tournament
- Generate statically at build time via `generateStaticParams` for all 48 qualified nations (once groups are known)
- Link from group tables in `/world-cup`

**Tech Stack:** Next.js 16 SSG/ISR, API-Football fixtures + standings + squads
**Challenge:** 48 teams means significant ISR cache warming; determining group assignment from standings API
**Definition of Done:** All 48 World Cup nations have a dedicated page at `/world-cup/team/[id]` with squad, group info, and match schedule

---

### 2.3 World Cup 2026 Module — Interactive Venue Map

**Problem:** No venue information page for World Cup. The `/world-cup` page lists the 3 host countries and stadium counts but no interactive map or individual venue pages.

**Current Implementation:**
- `app/world-cup/page.tsx` — static WC_HOSTS array (lines 16-19) with hardcoded stadium counts only

**Recommendation:**
- Build `app/world-cup/venues/page.tsx` — a dedicated venues hub
- Build individual `app/world-cup/venues/[id]/page.tsx` — venue detail with matches held there
- Implement an interactive map using Leaflet or Mapbox showing all 16 stadium pins
- Each pin shows: stadium name, capacity, host city, matches hosted
- Data could be static JSON (stadiums rarely change) + enriched with API-Football venue data

**Tech Stack:** Leaflet (react-leaflet), Mapbox, static venue data JSON
**Challenge:** Map component compatibility with SSR; sourcing accurate stadium data for all 16 venues
**Definition of Done:** Interactive map on `/world-cup/venues` with 16 pins; each stadium has a detail page with matches and capacity

---

### 2.4 World Cup 2026 Module — Outright Winner Betting Markets

**Problem:** No outright winner odds display for World Cup. The mainplan.md (line 108) lists this as a requirement.

**Current Implementation:**
- `lib/apifootball.ts` — has `getOdds(fixture)` and `getLiveOdds()` but no outright/betting markets endpoint coverage
- Match page shows match-winner odds only

**Recommendation:**
- Research API-Football's `/odds` endpoint for outright markets (league/betting type = outright)
- Build a `<OutrightOddsTable>` component for the World Cup sidebar
- Show top 10-15 teams with their current outright odds
- Update at 30s TTL via Redis cache
- Fallback: "Odds available closer to tournament date" when no data

**Tech Stack:** React 19, API-Football odds endpoint, Upstash Redis
**Challenge:** API-Football free tier may not include outright markets; data may only appear close to tournament
**Definition of Done:** Outright winner odds table displayed on `/world-cup` sidebar; gracefully degrades when API data is unavailable

---

### 2.5 Dedicated Odds Comparison Hub

**Problem:** Odds are currently only displayed **inline** on the `/match/[id]` page (lines 293-324). There is no `/odds` page where users can browse odds across multiple matches or leagues.

**Current Implementation:**
- `app/match/[id]/page.tsx` — embedded odds table within match detail
- No standalone odds page
- `app/leagues/[id]/page.tsx` — no odds section

**Recommendation:**
- Create `app/odds/page.tsx` — a centralized odds comparison hub showing:
  - Today's matches with best odds for 1X2 (Home/Draw/Away) across bookmakers
  - Filters by league, date range, bookmaker
  - Sort by kick-off time, odds value, or league
- Add odds mini-section to league pages: "Best Odds for Upcoming Fixtures"
- Create a reusable `<OddsTable>` component (extract from match/[id] page)
- Implement consistent data-fetch pattern (stale-while-revalidate, 180s TTL)

**Tech Stack:** React 19 Server Components, API-Football odds endpoint, Upstash Redis
**Challenge:** Free tier may heavily restrict odds data; optimizing to show many matches' odds without burning quota
**Definition of Done:** `/odds` page shows all today's matches with best odds; filterable by league; falls back gracefully when odds unavailable

---

### 2.6 Dynamic Entity Pages — Complete Data Coverage

**Problem:** `/player/[id]` and `/team/[id]` pages are missing several data sections documented in the API client:
- **Player page missing:** Sidelined/injuries (`getInjuries` exists in lib), recent form (fixtures for player's team), H2H data
- **Team page missing:** Team statistics (`getTeamStatistics` exists), injuries (`getInjuries`), venue details beyond name/capacity

**Current Implementation:**
- `app/player/[id]/page.tsx` — stats + trophies + transfers only
- `app/team/[id]/page.tsx` — squad + venue + fixtures + transfers
- Neither page uses `getInjuries`, `getTeamStatistics`, or extended statistics

**Recommendation:**
- **Player page additions:**
  - Injury/suspension history section via `getInjuries(fixture?, league?, season?)`
  - Form indicator: recent team results (W/D/L) when player was active
  - Per-league stats breakdown (player may have stats across multiple leagues — current code only shows `statistics[0]`)
- **Team page additions:**
  - Full team statistics section: goals scored/conceded, clean sheets, avg possession
  - Injury report: current injured players via `getInjuries(league, season)`
  - League selector in URL to switch between competitions
  - Season selector

**Tech Stack:** Existing `lib/apifootball.ts` functions, React 19
**Challenge:** API quota — each additional section = additional API call; need smart TTL strategy
**Definition of Done:** Player page shows injury history, form indicator, multi-league stats; team page shows team stats, injury report, league switcher

---

### 2.7 Real-Time Search / Discover

**Problem:** The search page (`app/search/page.tsx`) is a basic SSR form submission. There is no debounced/real-time search, no autocomplete, no recent searches, no keyboard navigation, and no mobile-friendly search sheet/overlay.

**Current Implementation:**
- `app/search/page.tsx` — URL query param → `Promise.allSettled` on 3 search endpoints
- Searches are full page navigations, no client-side filtering
- No search bar in the navbar
- Search results limit to 10 teams, 6 leagues, 9 players with `.slice()` — no pagination

**Recommendation:**
- Build a **search overlay** (Cmd-K / Ctrl-K) accessible from any page
- Implement **debounced client-side search** with 300ms delay — call `/api/search` endpoint
- **Server-side search API** route (`app/api/search/route.ts`) that:
  - Queries all 3 API endpoints in parallel
  - Caches results for 1 hour (search queries are reusable)
  - Returns serialized results as JSON
- **Search results page** (`/search`):
  - Infinite scroll or "Load more" for each category
  - Recent searches stored in localStorage
  - Keyboard navigation (arrow keys + Enter)
- Add a search icon to the navbar (desktop: Ctrl+K tooltip, mobile: magnifying glass icon)

**Tech Stack:** React 19 (client components for interactivity), Upstash Redis for query caching, Next.js API routes
**Challenge:** Free tier API search endpoints may not support partial matching well; balancing API quota vs. real-time feel
**Definition of Done:** Pressing Cmd-K opens search overlay; typing shows results within 300ms; 3 categorized result groups; keyboard navigation works; full search page supports pagination

---

### 2.8 Favorites UI

**Problem:** The Prisma schema includes a `Favorite` model (lines 58-69) with user-to-entity associations, but there is **no UI** for users to manage favorites — no "Add to Favorites" buttons, no favorites list/management page, no favorites filtering on league/team/player pages.

**Current Implementation:**
- `prisma/schema.prisma` — `Favorite` model with userId, type, entityId, name, logo
- No UI components or API routes for CRUD operations on favorites

**Recommendation:**
- Create API route `app/api/favorites/route.ts` with GET (list user's favorites) and POST (add/remove toggle)
- Add a `<FavoriteButton>` component that:
  - Shows a heart/star icon on team, player, and league pages
  - Toggles on click (filled = favorited, outline = not)
  - Calls the API route, optimistically updates UI
  - Uses `useSession` to require authentication (redirect to sign-in if not logged in)
- Create `app/favorites/page.tsx` — a dashboard showing user's saved teams, players, and leagues
- Integrate favorites into homepage: show favorited teams' matches at top (pinned section)

**Tech Stack:** NextAuth.js, Prisma 7.x, React 19 client components, optimistic UI
**Challenge:** Optimistic updates with proper rollback; mobile touch interactions; SSR/CSR data sync
**Definition of Done:** Users can click a heart icon on any team/player/league page to save it; `/favorites` page shows all saved entities with quick links; favorites appear pinned on homepage

---

## PART 3: INFRASTRUCTURE / STABILITY

These items are **non-functional requirements** that ensure the application can be maintained, scaled, and deployed reliably.

---

### 3.1 Docker Compose Environment

**Problem:** No `docker-compose.yml` exists. Local development requires manual installation of PostgreSQL and Redis with environment-specific configurations. The mainplan.md (line 108) lists this as a requirement.

**Current Implementation:**
- No Docker configuration files
- No local development orchestration
- Single `.env` file — no multi-environment strategy (dev/staging/prod)

**Recommendation:**
- Create `docker-compose.yml` with services:
  - `postgres`: PostgreSQL 16 with volume mount for data persistence
  - `redis`: Redis 7 for caching and rate limiting (Upstash-compatible config)
  - `app`: Next.js development server with hot reload
- Create `Dockerfile` for production builds
- Create `.env.development`, `.env.staging`, `.env.production` with corresponding `.env.example` files
- Add a `Makefile` or `scripts/` directory with common dev commands:
  - `make dev` — starts all containers
  - `make db:reset` — resets database
  - `make seed` — seeds sample data

**Tech Stack:** Docker Compose v2, PostgreSQL 16, Redis 7, Node.js 22
**Challenge:** Windows/macOS compatibility for volume mounts and hot reload; keeping container versions in sync with production (Vercel Postgres/Upstash)
**Definition of Done:** `docker compose up` starts Postgres + Redis + Next.js dev server; `npm run dev` works without any other manual setup

---

### 3.2 Background Job System (Cron-Based Data Sync)

**Problem:** No background job scheduler exists. The application relies entirely on **on-demand SSR data fetching**. There is no mechanism to proactively poll API-Football for fresh data and write to the database.

**Current Implementation:**
- Data is fetched on page request with SSR + caching
- No background sync, no database persistence of fixture/league data
- The SSE endpoint (`app/api/live/route.ts`) polls every 30s but only per-connected client (wasteful)

**Recommendation:**
- Evaluate options:
  - **Vercel Cron Jobs** (simplest, serverless-friendly) — configure `vercel.json` with cron schedules
  - **Inngest** (serverless job queue) — better for complex workflows with retries
  - **BullMQ + Redis** (most powerful) — but requires persistent Redis server
- Implement daily sync jobs:
  - `sync-leagues`: Refresh league metadata at season start
  - `sync-fixtures`: Daily sync of next 7 days of fixtures for major leagues
  - `sync-standings`: Sync standings every 30 minutes during match windows
  - `sync-player-stats`: Refresh top player stats hourly
- Use Prisma to upsert all synced data into PostgreSQL
- Add a sync status table to track last sync times and errors

**Tech Stack:** Vercel Cron Jobs (recommended for simplicity) or Inngest, Prisma 7.x, API-Football
**Challenge:** Cron jobs on free Vercel plan are limited; serverless function timeout (max 60s on Hobby, 300s on Pro)
**Definition of Done:** Leagues, fixtures, standings, and top scorers are automatically synced to PostgreSQL on a schedule; admin page shows last sync times

---

### 3.3 Testing Suite (Unit + Integration + E2E)

**Problem:** Only 2 test files exist (`components/__tests__/MatchCard.test.tsx` and `lib/__tests__/apifootball.test.ts`). There is no integration testing for API routes, no E2E testing, and no CI pipeline.

**Current Implementation:**
- `vitest.config.ts` — configured for Vitest
- `lib/test-setup.ts` — test setup file exists
- `components/__tests__/MatchCard.test.tsx` — single component test
- `lib/__tests__/apifootball.test.ts` — single API client test

**Recommendation:**
- **Unit Tests (Vitest):**
  - Test all utility functions in `lib/utils.ts` (formatting, status labels, countdown)
  - Test validation schemas in `lib/validation.ts` with valid/invalid inputs
  - Test caching logic in `lib/apifootball.ts` (mock Redis and axios)
- **Integration Tests:**
  - Test API routes (`/api/predict`, `/api/live`, `/api/status`) with mocked auth and database
  - Use Vitest + Supertest for HTTP integration tests
  - Use MSW (Mock Service Worker) to mock API-Football responses
- **E2E Tests (Playwright):**
  - Test critical user flows: search for a team → view team page → click player → view player page
  - Test World Cup hub: group standings render → click team → team page loads
  - Test prediction flow: sign in → navigate to match → submit prediction
  - Test favorites flow: sign in → favorite a team → verify on favorites page
- **CI/CD Pipeline:**
  - Create `.github/workflows/ci.yml` — runs lint + typecheck + tests on PR
  - Create `.github/workflows/deploy.yml` — deploys to Vercel on merge to main

**Tech Stack:** Vitest 2.x, Playwright, MSW 2.x, Supertest, GitHub Actions
**Challenge:** Mocking API-Football responses that change daily; test data fixtures that stay relevant; Playwright browser binaries in CI
**Definition of Done:** `npm test` passes (all unit + integration tests); `npx playwright test` passes (E2E flows); GitHub Actions runs both on every PR

---

### 3.4 Observability — Error Tracking & Performance Monitoring

**Problem:** No error tracking or performance monitoring tools are integrated. The only observability is `console.error` calls in catch blocks and the ErrorBoundary component. There is no way to monitor production errors or performance regressions.

**Current Implementation:**
- `components/ErrorBoundary.tsx` — catches render errors with `console.error`
- Scattered `console.error` in catch blocks
- No Sentry, Datadog, OpenTelemetry, or similar

**Recommendation:**
- Integrate **Sentry** for error tracking:
  - Install `@sentry/nextjs`
  - Configure DSN in environment variables
  - Set up performance tracing for page loads and API routes
  - Add custom breadcrumbs for API calls and auth events
  - Source map upload for stack trace readability
- Set up **Vercel Analytics** for web vitals (LCP, CLS, INP) — free on Vercel
- Add **structured logging** with `pino` or `winston`:
  - Log key events: API quota usage, cache misses, rate-limit blocks, auth failures
  - Use `NEXT_PUBLIC_VERCEL_ENV` to differentiate dev/staging/prod log levels
- Create a **health check endpoint** `app/api/health/route.ts`:
  - Returns status of PostgreSQL, Redis, and API-Football connectivity
  - Used by monitoring tools (Uptime Robot, Better Uptime)

**Tech Stack:** @sentry/nextjs, Vercel Analytics, pino (structured logging)
**Challenge:** Sentry source map uploads require API key management; performance tracing may add latency to serverless functions
**Definition of Done:** Errors in production are captured in Sentry with full stack traces; Vercel Analytics shows real user monitoring data; `/api/health` reports component status

---

### 3.5 Expanded JSON-LD Structured Data

**Problem:** JSON-LD structured data is only implemented on the match detail page (`app/match/[id]/page.tsx`, lines 65-83) as a `SportsEvent` schema. No other pages have structured data, which limits search engine rich result eligibility.

**Current Implementation:**
- `app/match/[id]/page.tsx` — `SportsEvent` JSON-LD (line 65-83)
- All other pages: only `<title>` and `<meta>` in `generateMetadata`
- `app/layout.tsx` — OpenGraph tags only (site name, description)

**Recommendation:**
- **League page** (`/leagues/[id]`): Add `SportsOrganization` schema with league name, logo, sport
- **Team page** (`/team/[id]`): Add `SportsTeam` schema with name, logo, location, member of (league)
- **Player page** (`/player/[id]`): Add `Person` schema with name, nationality, birth date, affiliated team
- **World Cup page** (`/world-cup`): Add `SportsEvent` for the tournament itself (start date, end date, location)
- **Match page** (improvements): Add `competitor` details (team logos, URLs), `eventStatus`, `eventAttendanceMode`

Create a reusable utility `lib/json-ld.ts` that generates these schemas to avoid inline `<script>` tags.

**Tech Stack:** JSON-LD (schema.org), Next.js 16, React 19
**Challenge:** Validating JSON-LD with Google Rich Results Test; ensuring sports-specific schema types are correctly nested
**Definition of Done:** All entity detail pages (league, team, player, match, world-cup) include valid JSON-LD structured data; passes Google Rich Results Test

---

## PART 4: IMPLEMENTATION SEQUENCE

### Sprint 1 — Hardening (Critical/Immediate)
1. **1.1 Graceful Error States & Skeleton Loaders** — Core UX stability
2. **1.2 API Rate Limit Hardening** — Prevent quota exhaustion
3. **1.3 Admin Dashboard — Quota Monitoring** — Visibility into system health

### Sprint 2 — World Cup Foundation (Feature Growth)
4. **2.1 Knockout Bracket Component** — Core World Cup feature
5. **2.2 World Cup Nation Hubs** — 48 team detail pages
6. **2.4 Outright Winner Betting Markets** — Sidebar widget

### Sprint 3 — Search & Engagement (Feature Growth)
7. **2.7 Real-Time Search / Discover** — Cmd-K overlay + debounced search
8. **2.8 Favorites UI** — Heart button + management page
9. **2.6 Dynamic Entity Pages** — Complete data coverage (injuries, team stats)

### Sprint 4 — Odds Hub & World Cup Polish (Feature Growth)
10. **2.5 Dedicated Odds Comparison Hub** — Standalone `/odds` page
11. **2.3 World Cup Venue Map** — Interactive stadium map

### Sprint 5 — Infrastructure (Infrastructure/Stability)
12. **3.1 Docker Compose Environment** — Containerized local dev
13. **3.2 Background Job System** — Cron-based data sync
14. **3.5 Expanded JSON-LD** — Structured data for all entity types

### Sprint 6 — Quality & Observability (Infrastructure/Stability)
15. **3.3 Testing Suite + CI/CD** — Automated quality gates
16. **3.4 Observability** — Sentry + Vercel Analytics + health endpoint

---

## 📊 GAP ANALYSIS SUMMARY

| Category | Status | Gaps Identified | Est. Effort |
|---|---|---|---|
| **Home Page** | ✅ Functional | No skeleton loaders | 2 days |
| **League Pages** | ✅ Functional | No odds section, no favorites integration | 2 days |
| **Match Pages** | ✅ Functional | Missing H2H tab fully | 1 day |
| **Team Pages** | ⚠️ Partial | Missing team stats, injuries, season selector | 3 days |
| **Player Pages** | ⚠️ Partial | Missing injuries, multi-league stats, form | 3 days |
| **Search** | ❌ Minimal | No real-time, no Cmd-K, no pagination | 5 days |
| **World Cup Hub** | ⚠️ Partial | No bracket, no nation hubs, no venue map, no outright odds | 10 days |
| **Odds Hub** | ❌ Missing | No dedicated odds page | 3 days |
| **Favorites** | ❌ Missing | Schema exists, no UI | 3 days |
| **Admin Dashboard** | ⚠️ Basic | No per-endpoint tracking, no controls | 4 days |
| **Rate Limiting** | ⚠️ Basic | Global only, no per-endpoint budgets | 3 days |
| **Error Handling** | ❌ Minimal | No skeleton loaders, no fallback UI | 3 days |
| **Docker** | ❌ Missing | No containerization | 2 days |
| **Background Jobs** | ❌ Missing | No cron-based data sync | 4 days |
| **Testing** | ❌ Minimal | 2 test files only | 8 days |
| **CI/CD** | ❌ Missing | No pipeline | 2 days |
| **Observability** | ❌ Missing | No Sentry, no performance monitoring | 3 days |
| **JSON-LD** | ⚠️ Partial | Only on match pages | 3 days |

**Total Estimated Effort:** ~60 days (12 sprints of 5 days each, or 6 two-week sprints)

---

## RISK REGISTER

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| API-Football free tier quota exhausted during peak usage | High | Critical — entire site goes dark | Aggressive caching, stale-while-revalidate, priority queue |
| Free API not returning World Cup data (league=1, season=2026) | Medium | High — World Cup module invisible | Have static fallback data ready; test early with 2025 data |
| Vercel serverless timeout (max 60s/300s) for data-heavy pages | Medium | Medium — pages fail to load | ISR + data splitting; background sync to DB avoids long fetches |
| Next.js 16.x breaking changes (bleeding edge) | Medium | Medium — build failures | Pin next version in package.json; read `node_modules/next/dist/docs/` |
| 48 nation pages generating 48x build-time API calls | Medium | Low — slow builds | Use ISR instead of SSG; stagger generation |
| Docker compatibility on Windows/macOS | Low | Medium — dev environment issues | Use Docker Compose profiles; document workarounds |
| Playwright test flakiness from dynamic API data | Medium | Medium — CI failures | Mock API responses in E2E tests; use fixture data files |

---

## APPENDIX: CURRENT CODEBASE STATE MAP

```
activesports/
│
├── app/                           # Next.js 16 App Router
│   ├── page.tsx                   # ✅ Home — Live + Today fixtures
│   ├── layout.tsx                 # ✅ Root layout — fonts, session, nav, error boundary
│   ├── loading.tsx                # ✅ Basic loading state
│   ├── globals.css                # ✅ Design tokens, animations, utilities
│   │
│   ├── admin/
│   │   └── page.tsx               # ⚠️ Basic API quota monitor
│   ├── leagues/
│   │   ├── page.tsx               # ❌ Not reviewed
│   │   └── [id]/page.tsx          # ✅ Standings + top scorers + fixtures
│   ├── match/
│   │   └── [id]/page.tsx          # ✅ Events + stats + lineups + predictions + odds + JSON-LD
│   ├── player/
│   │   └── [id]/page.tsx          # ⚠️ Stats + trophies + transfers (missing injuries, form)
│   ├── team/
│   │   └── [id]/page.tsx          # ⚠️ Squad + venue + fixtures + transfers (missing team stats)
│   ├── search/
│   │   └── page.tsx               # ❌ Basic SSR search (no real-time, no Cmd-K)
│   ├── world-cup/
│   │   └── page.tsx               # ⚠️ Countdown + groups + scorers (no bracket, no nation hubs, no venue map)
│   ├── predictions/
│   │   └── page.tsx               # ❌ Not reviewed
│   ├── leaderboard/
│   │   └── page.tsx               # ❌ Not reviewed
│   │
│   └── api/
│       ├── auth/[...nextauth]/    # ✅ NextAuth.js handlers
│       ├── live/route.ts          # ✅ SSE endpoint for live updates
│       ├── predict/route.ts       # ✅ Prediction CRUD with Zod validation
│       └── status/route.ts        # ✅ API status endpoint
│
├── components/
│   ├── ErrorBoundary.tsx          # ✅ Class-based error boundary (basic)
│   ├── MatchCard.tsx              # ✅ Match display card
│   ├── Navbar.tsx                 # ✅ Responsive nav with auth + mobile menu
│   ├── PredictionWidget.tsx       # ✅ Client-side prediction form
│   ├── StandingsTable.tsx         # ✅ League standings table
│   ├── WorldCupCountdown.tsx      # ✅ Countdown timer component
│   └── __tests__/
│       └── MatchCard.test.tsx     # ⚠️ One test file
│
├── config/
│   └── leagues.ts                 # ✅ League constants (MAJOR_LEAGUES, seasons)
│
├── lib/
│   ├── apifootball.ts             # ✅ API client with caching (Full endpoint coverage)
│   ├── prisma.ts                  # ✅ Prisma client singleton
│   ├── utils.ts                   # ✅ Formatting, status labels, form colors
│   ├── validation.ts              # ✅ Zod schemas for API input
│   ├── test-setup.ts              # ⚠️ Test setup
│   └── __tests__/
│       └── apifootball.test.ts    # ⚠️ One test file
│
├── prisma/
│   └── schema.prisma              # ⚠️ User, Account, Session, Favorite, Prediction models
│
├── auth.ts                        # ✅ NextAuth config (Google + GitHub providers)
├── middleware.ts                  # ⚠️ Global rate limiting (100/day) for /api/*
├── next.config.ts                 # ❌ Empty — no image domains, no redirects
├── vitest.config.ts               # ⚠️ Configured but underutilized
├── docker-compose.yml             # ❌ Missing
├── .env                           # ❌ Single file (no multi-environment strategy)
└── mainplan.md                    # ✅ Architecture plan (many unimplemented items)
```

---

*This audit was generated from a comprehensive review of the codebase as of May 11, 2026. Priorities should be revisited as the World Cup 2026 start date (June 11) approaches.*

---

## SPRINT 1 IMPLEMENTATION LOG

### Start Date: May 11, 2026

#### Completed Items

**1.1 Graceful Error States & Skeleton Loaders**
- ✅ Created `components/Skeleton.tsx` — 7 reusable skeleton variants (Skeleton, SkeletonCard, SkeletonTable, SkeletonPlayerCard, SkeletonGrid, SkeletonFixtureList)
- ✅ Created `components/FallbackState.tsx` — Client component with 3 variants (empty, error, info) + optional retry action
- ✅ Created `components/AsyncSection.tsx` — Pattern wrapper handling loading→skeleton, error→fallback, empty→no-data, success→children
- ✅ Applied to **homepage** (`app/page.tsx`): Added `fetchError` state variable, displays `<FallbackState>` on error vs. "No matches today" on empty vs. fixture lists on success
- ✅ Applied to **league page** (`app/leagues/[id]/page.tsx`): All 3 data sections (standings, fixtures, top scorers) wrapped with `<AsyncSection>` including per-section error tracking
- ✅ Applied to **player page** (`app/player/[id]/page.tsx`): Trophy cabinet and transfer history sections wrapped with `<AsyncSection>`
- ✅ Applied to **team page** (`app/team/[id]/page.tsx`): Squad, fixtures (recent + upcoming), and transfers sections wrapped with `<AsyncSection>`
- ✅ Match page (`app/match/[id]/page.tsx`): Imports already added; existing conditional rendering pattern serves as effective fallback

**1.2 API Rate Limit Hardening**
- ✅ Added **quota budget tracking** in `lib/apifootball.ts`: `requestCountToday`, `quotaExhausted`, `quotaResetTime` with auto-reset
- ✅ Added **priority system**: `'HIGH' | 'MEDIUM' | 'LOW'` with corresponding TTLs
- ✅ Added `canMakeRequest()` check: Safety budget of 90/100 daily requests
- ✅ Added **priority override**: HIGH priority requests can bypass quota guard for critical live data
- ✅ **Stale cache fallback**: MEDIUM/LOW priority requests gracefully use stale cache when quota is exhausted
- ✅ Added `staleTimes` experimental config in `next.config.ts`

**1.3 Admin Dashboard Enhancement — Prerequisites**
- ✅ Updated `next.config.ts` with image remote patterns (api-sports.io, Google/GitHub avatars)
- ✅ Added `staleTimes` experimental config for ISR caching

#### Files Modified
| File | Change |
|---|---|
| `components/Skeleton.tsx` | New — 7 skeleton variants |
| `components/FallbackState.tsx` | New — Error/empty/info states |
| `components/AsyncSection.tsx` | New — Section wrapper pattern |
| `app/page.tsx` | Added fetchError + FallbackState |
| `app/leagues/[id]/page.tsx` | Wrapped 3 sections with AsyncSection |
| `app/player/[id]/page.tsx` | Wrapped 2 sections with AsyncSection |
| `app/team/[id]/page.tsx` | Wrapped 3 sections with AsyncSection |
| `app/match/[id]/page.tsx` | Added skeleton/async imports |
| `lib/apifootball.ts` | Added quota budget + priority system |
| `next.config.ts` | Added images + staleTimes config |
