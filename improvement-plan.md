# ActiveSports Improvement Plan

Audit based on codebase analysis — May 11, 2026.

---

## P0 — Critical (single points of failure)

> **Note:** You mentioned switching to a paid API-Football plan before going live — the quota exhaustion items below are noted but not urgent for your case. The caching/TTL strategy is still recommended to keep response times fast even on an unlimited plan.

### 1. API Quota Exhaustion Protection

**Status:** 🟢 Deferred to paid plan — not blocking.

The free tier (100 req/day) is fine for development. When you switch to a paid plan, review the per-endpoint TTLs in `lib/apifootball.ts` to ensure they're generous enough to minimize origin calls. The current caching strategy (60s–24h TTLs, in-memory + Redis) is already well-structured.

### 2. Error Tracking (Sentry) Not Active

**Problem:** `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` exist but Sentry DSN is likely not set in env. Errors are silently swallowed in catch blocks with `console.error`.

**Do:**
- Configure `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` in production env
- Add `sentry.reportError()` or Sentry.captureException in all catch blocks across `lib/apifootball.ts` and page components
- Verify source maps upload in Vercel deploys so stack traces are readable

---

## P1 — SEO & Discovery

### 3. Missing Sitemap & Robots

**Problem:** No `app/sitemap.ts` or `app/robots.ts`. Google cannot discover your 6+ dynamic entity pages.

**Do:**
- Create `app/sitemap.ts` with static entries for all 10 static pages + dynamic entries for major leagues (top 10), popular teams, and World Cup venue pages
- Generate `app/robots.ts` — allow all crawlers, point to sitemap
- For dynamic pages with `generateStaticParams` (e.g. WC venues), use `revalidate` in sitemap entries for ISR-aware crawlers

### 4. JSON-LD Structured Data Coverage

**Problem:** `lib/json-ld.ts` has generators for `SportsEvent`, `SportsTeam`, `Person`, and `SportsOrganization` schemas. Only league pages (`app/leagues/[id]/page.tsx:49`) use them consistently. Team and player pages still use inline JSON-LD (match page) or none.

**Do:**
- Team pages: add `generateSportsTeamLD` with name, logo, league affiliation, country, founding year
- Player pages: add `generatePersonLD` with name, photo, nationality, birth date, team affiliation
- Match pages: enrich existing JSON-LD with competitor URLs, eventStatus enum (Scheduled/Live/Finished), venue details
- World Cup hub: add `SportsEvent` for the tournament itself (start/end dates, location, 48 teams)

### 5. noindex Empty/Error Pages

**Problem:** When API returns no data, pages render empty shells that Google may index as thin content.

**Do:**
- Add `meta robots noindex` to pages when all data sections fail to load
- Conditionally set `generateMetadata` to return `{ robots: { index: false } }` when API calls fail
- Affected pages: leagues/[id], team/[id], player/[id], match/[id], search

---

## P2 — Performance & UX

### 6. Pre-render Popular Dynamic Pages

**Problem:** `/team/[id]`, `/player/[id]`, `/leagues/[id]` are fully SSR with no `generateStaticParams`. Every request hits the API (or cache), adding latency.

**Do:**
- Add `generateStaticParams` to pre-render the top 10 major league pages at build time
- For teams, pre-render all teams in the top 5 leagues (roughly 100 pages) — they rarely change
- Use `revalidate` with ISR so stale pages are refreshed in background
- Player pages are harder to pre-render (too many) but can use `staleTimes` from next.config.ts:28

### 7. World Cup Traffic Planning

**Problem:** WC 2026 starts June 11. This app could see a traffic spike. Vercel serverless costs scale with usage.

**Do:**
- Implement broad ISR (revalidate: 300-3600) on all WC pages to minimize function invocations
- Ensure Redis caching covers all WC data endpoints with appropriate TTLs (groups: 300s, bracket: 60s, top scorers: 600s)
- Consider adding a CDN (Vercel Edge Cache) with `Cache-Control: s-maxage=60, stale-while-revalidate=300` headers
- Set up Vercel usage alerts and cost bounds

### 8. PWA / Offline Support

**Problem:** Sports scores are browsed on mobile with spotty connections. No service worker or manifest.

**Do:**
- Generate `public/manifest.json` with app name, icons, theme color (`#0F172A`)
- Create `app/manifest.ts` for Next.js PWA manifest
- Add a minimal service worker (via `public/sw.js` or `next-pwa`) that caches static assets and fixture data
- `beforeinstallprompt` event listener for "Add to Home Screen"

---

## P3 — Infrastructure & Security

### 9. Rate Limiting Scope Gap

**Problem:** `middleware.ts:24` rate-limits `/api/*` only. Server-side data fetching in page components bypasses this entirely. The in-memory quota tracker in apifootball.ts is process-local and resets on every Vercel cold start.

**Do:**
- Move quota tracking to Redis so it persists across serverless function invocations
- Apply per-IP rate limiting to SSR page fetches, not just API routes
- Implement a priority queue: high-priority (live scores) bypasses soft limit, low-priority (historic data) gets dropped first

### 10. Security Headers

**Problem:** No security headers are set. No CSP, no HSTS, no X-Frame-Options.

**Do:**
- Add `Content-Security-Policy` in `next.config.ts` via `headers()` async function
  - Restrict script-src to self + 'unsafe-inline' (needed for Next.js)
  - Restrict img-src to self + media.api-sports.io + lh3.googleusercontent.com
  - Restrict connect-src to self + v3.football.api-sports.io
- Add `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`
- Add `next.config.ts` headers config:

```ts
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ];
}
```

### 11. Environment Variables Hygiene

**Problem:** Single `.env` file. No `.env.development`, `.env.staging`, `.env.production`. Risk of leaking production secrets.

**Do:**
- Create `.env.development` with local Postgres + Redis + mock API keys
- Create `.env.production` template with required vars documented
- Add `.env.development`, `.env.staging`, `.env.production` to `.gitignore`
- Document required vars in README

---

## P4 — Polish & Engagement

### 12. Breadcrumb Structured Data

**Problem:** Nested pages (match, team, player, league) have no BreadcrumbList JSON-LD. Google uses these for sitelinks.

**Do:**
- Create `lib/json-ld.ts` breadcrumb generator
- Add breadcrumbs to:
  - `/match/[id]` — Scores > League > Match
  - `/team/[id]` — Scores > League > Team
  - `/player/[id]` — Scores > Team > Player
  - `/world-cup/venues/[id]` — World Cup > Venues > Venue

### 13. Dark Mode Toggle

**Problem:** Redesigned UI removed dark mode. Sports fans browse at night. `prefers-color-scheme` is not used.

**Do:**
- Add a theme toggle component (sun/moon icon in navbar)
- Store preference in `localStorage` + a cookie for SSR
- Use `@media (prefers-color-scheme: dark)` as default for first visit
- Define dark CSS variables for `--bg-body`, `--bg-surface`, `--bg-subtle`, `--border`, `--text-body`, `--text-muted`
- Apply via `class="dark"` on `<html>` element

### 14. Keyboard Navigation & Shortcuts

**Problem:** Power users navigate with keyboard. Only search overlay supports this.

**Do:**
- Add `j`/`k` navigation on leaderboard and standings tables
- `n` key to jump to next match on match pages
- `h` to go home, `/` to open search
- Left/right arrows on match page to navigate between consecutive fixtures
- Show shortcuts in a tooltip on first visit

### 15. Favorites Polish

**Problem:** Favorites feature exists (Prisma model + API + button + page) but no integration with homepage.

**Do:**
- Show favorited teams' upcoming matches in a "Your Teams" section at the top of homepage (pinned above live scores)
- Add favorites count badge to the heart icon in navbar
- Sort favorites by next match date on `/favorites` page
- Add "Add all teams in this league" quick-action on league pages

---

## Implementation Priority

```
Week 1  │ P0: Quota hardening + Sentry activation
Week 2  │ P1: Sitemap + robots + JSON-LD coverage + noindex
Week 3  │ P2: Pre-render popular pages + WC traffic prep
Week 4  │ P2: PWA manifest + service worker
Week 5  │ P3: Redis-backed rate limiting + security headers + env hygiene
Week 6+  │ P4: Dark mode + keyboard shortcuts + favorites polish + breadcrumbs
```
