# ActiveSports — SEO Speed & Mass Indexing Plan

**Goal:** Rank faster via Core Web Vitals optimization + generate millions of indexable pages.

---

## Phase 1 — Bulk Static Generation (Highest ROI)

### 1.1 Pre-render All Teams in Major Leagues

**Current:** `/team/[id]` is fully dynamic (SSR). Every request hits the server.

**Target:** 200+ team pages pre-built as static HTML at deploy time, revalidated via ISR.

```ts
// app/team/[id]/page.tsx
export async function generateStaticParams() {
  const LEAGUES = [2, 3, 39, 61, 78, 135, 140]; // UCL, UEL, PL, L1, BL, SA, LL
  const ids = new Set<number>();
  for (const leagueId of LEAGUES) {
    const standings = await getStandings(leagueId, 2024).catch(() => []);
    for (const s of standings) {
      for (const t of s) ids.add(t.team.id);
    }
  }
  return [...ids].map(id => ({ id: String(id) }));
}
```

- **Build time:** ~2s extra (7 API calls, parallelized)
- **Benefit:** 200+ static pages served from CDN edge, 0 serverless invocations
- **ISR:** `revalidate: 300` — stale pages refresh in background

### 1.2 Pre-render All Players in Those Teams

**Current:** `/player/[id]` is fully dynamic.

**Target:** 5,000+ player pages pre-built.

```ts
// app/player/[id]/page.tsx
export async function generateStaticParams() {
  const LEAGUES = [2, 3, 39, 61, 78, 135, 140];
  const ids = new Set<number>();
  for (const leagueId of LEAGUES) {
    const teams = await getStandings(leagueId, 2024).catch(() => []);
    for (const s of teams) {
      for (const t of s) {
        const squad = await getSquad(t.team.id).catch(() => []);
        for (const p of (squad[0]?.players ?? [])) ids.add(p.id);
      }
    }
  }
  return [...ids].map(id => ({ id: String(id) }));
}
```

- **Build time:** ~30s (200 squad API calls — parallelize with batch concurrency of 10)
- **Benefit:** 5,000+ player pages static at deploy
- **Consideration:** Upstash paid plan may be needed for this many API calls at build

### 1.3 Structured API Cache Warming Script

Create `scripts/warm-cache.ts` — run post-deploy in CI:

```ts
// Called after Vercel deploy: `npx tsx scripts/warm-cache.ts`
// Hits all major team, player, and league URLs to populate ISR cache
// so first real visitor gets cached response instead of cold start
```

**Flow:**
1. Fetch list of all team IDs (same logic as 1.1)
2. Fetch list of all player IDs (same logic as 1.2)
3. HTTP GET every URL → serverless functions execute once → ISR cache primed
4. Run via GitHub Actions post-deploy or Vercel post-deploy hook

---

## Phase 2 — Index Pages & Crawl Paths

### 2.1 Create Team Index Pages

**`/teams`** — paginated list of all teams across all leagues
```ts
export const dynamicParams = false; // only pre-built pages
export async function generateStaticParams() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  return alphabet.map(letter => ({ letter }));
}
```
- Alphabetical pagination: `/teams/a`, `/teams/b`, ... `/teams/z`
- Each page lists 20-30 teams starting with that letter
- Creates crawl paths for Google to discover every team

**`/leagues/[id]/teams`** — all teams in a specific league
- Links from league page → more specific team context
- Internal anchor text: "Browse all 20 Premier League teams"

### 2.2 Create Player Index Pages

**`/players`** — paginated player directory
- Same alphabetical pagination: `/players/a` through `/players/z`
- Each page: 50 players with photo, name, nationality, team link
- Combined with `/players?nationality=england` etc. for filters

### 2.3 Internal Linking Architecture

| Page | Links To | Purpose |
|------|----------|---------|
| Homepage | Top 5 live matches, 8 major leagues | Distribute authority to key pages |
| League page | Standings (20 teams), top scorers (10 players) | Deep crawl path to teams |
| Team page | Squad (25 players), recent fixtures (5) | Deep crawl path to players |
| Player page | Team link, transfer teams | Cross-linking relevance |
| Index pages (A-Z) | Every team/player | Complete coverage |
| Match page | Both teams, league | Contextual relevance |

**Rule:** Every page should link to at least 5-10 other pages. No orphan pages.

---

## Phase 3 — Sitemap Scale (Millions of URLs)

### 3.1 Sitemap Index (split into multiple files)

```ts
// app/sitemap.ts
export default function sitemap() {
  return [
    { url: '/sitemap-static.xml', ... },
    { url: '/sitemap-leagues.xml', ... },
    { url: '/sitemap-teams.xml', ... },
    { url: '/sitemap-players.xml', ... },
    { url: '/sitemap-venues.xml', ... },
  ];
}
```

### 3.2 Generate Sitemap Files

**`app/sitemap-teams.ts`** — dynamic sitemap for all 200+ teams
```ts
export default async function sitemap() {
  const teams = await getAllTeams(); // same logic as 1.1
  return teams.map(t => ({
    url: `https://activesports.app/team/${t.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));
}
```

**`app/sitemap-players.ts`** — dynamic sitemap for 5,000+ players
```ts
export default async function sitemap() {
  const players = await getAllPlayers(); // same logic as 1.2
  return players.map(p => ({
    url: `https://activesports.app/player/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.5,
  }));
}
```

**`app/sitemap-index-pages.ts`** — A-Z index pages
```ts
export default function sitemap() {
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  return [
    ...letters.map(l => ({ url: `/teams/${l}`, ... })),
    ...letters.map(l => ({ url: `/players/${l}`, ... })),
  ];
}
```

**Google limit:** 50,000 URLs per sitemap file, unlimited sitemaps per index. With 5,000 players we're safely under.

### 3.3 Submit to Google Search Console

- Generate sitemap index URL: `https://activesports.app/sitemap.xml`
- Automate resubmission on deploy via `curl` to Google Indexing API

---

## Phase 4 — Core Web Vitals Optimization

### 4.1 Streaming with Suspense Boundaries

**Current:** Every page waits for all data fetches before rendering.

**Target:** First paint in <1s by streaming independent sections.

```tsx
// app/team/[id]/page.tsx
export default function TeamPage({ params }) {
  return (
    <div>
      <TeamHero id={params.id} /> {/* async — streams first */}
      <Suspense fallback={<SkeletonTable />}>
        <SquadSection id={params.id} />
      </Suspense>
      <div className="grid grid-cols-2">
        <Suspense fallback={<SkeletonFixtureList />}>
          <FixturesSection id={params.id} />
        </Suspense>
        <Suspense fallback={<SkeletonList />}>
          <TransfersSection id={params.id} />
        </Suspense>
      </div>
    </div>
  );
}
```

**Impact:** LCP drops from ~3s to ~1.2s for the hero section. Remaining sections stream in progressively.

### 4.2 Image Optimization

- Add `priority` to LCP image on every page (team logo on team page, player photo on player page, etc.)
- Set explicit `width`/`height` on all images to prevent Cumulative Layout Shift
- Add `preconnect` to API image CDN:
```tsx
// app/layout.tsx — in head
<link rel="preconnect" href="https://media.api-sports.io" />
<link rel="dns-prefetch" href="https://media.api-sports.io" />
```

### 4.3 Reduce JavaScript Bundles

- Lazy-load Sentry SDK — currently bundled in critical path (~30KB)
- Lazy-load heavy components: StandingsTable, PredictionWidget, KnockoutBracket
- Use `next/dynamic` with `ssr: false` for non-critical interactive components

### 4.4 Inline Critical CSS

Currently all CSS is a single external file loaded via `<link>`. Extract above-fold CSS:
- Hero section styles (team header, player header)
- Card base styles (used everywhere — already minimal)
- Layout grid styles

Next.js `critical` experiment or manual inline in `layout.tsx` `<head>`.

---

## Phase 5 — AI Content Generation (OpenRouter)

### 5.1 When to Generate vs. When to Keep Static

| Content Type | Source | Strategy |
|-------------|--------|----------|
| Player bio | OpenRouter | Generate for top 5000 players |
| Team description | OpenRouter | Generate for all 200 teams |
| Match preview | OpenRouter | Generate on-demand for upcoming fixtures (scheduled job) |
| League overview | OpenRouter | Generate for 8 major leagues + 50+ minor leagues |
| Venue description | Static | Already hardcoded in WC_VENUES |
| Stats, standings | API | Always live API data |

### 5.2 Integration Architecture

```ts
// lib/content-generator.ts
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

interface ContentCache {
  key: string;
  content: string;
  generatedAt: Date;
  model: string;
}

export async function generateContent(prompt: string, cacheKey: string): Promise<string> {
  // Check Postgres/Redis cache first
  const cached = await prisma.contentCache.findUnique({ where: { key: cacheKey } });
  if (cached) return cached.content;

  const completion = await client.chat.completions.create({
    model: 'openai/gpt-4o-mini', // cheap & fast
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
  });

  const content = completion.choices[0]?.message?.content ?? '';

  await prisma.contentCache.create({
    data: { key: cacheKey, content, generatedAt: new Date(), model: 'gpt-4o-mini' },
  });

  return content;
}
```

### 5.3 Content Generation Prompts

**Player bio** (150 tokens max):
```
Write a 2-sentence bio for {name}, a {nationality} football player
who plays as a {position} for {team}. Mention their playing style
and key strength. Keep it factual and concise.
```

**Team description** (100 tokens max):
```
Write a one-sentence description of {team} football club from {country},
founded in {year}. Mention their league, stadium {name},
and reputation. Tone: neutral, informative.
```

**Match preview** (200 tokens max):
```
Generate a match preview for {home} vs {away} in the {league}.
Home form: {home_form}. Away form: {away_form}.
Key stat: {stat}. 2-3 sentences, analytical tone.
```

### 5.4 Content Integration Points

| Page | Content Element | Source | SEO Benefit |
|------|----------------|--------|-------------|
| `/team/[id]` | Meta description | AI-generated from team name + league | Rich snippets |
| `/team/[id]` | JSON-LD `description` field | AI-generated | Knowledge panel |
| `/team/[id]` | H2 "About {team}" section | AI-generated (collapsed/expandable) | Long-tail keywords |
| `/player/[id]` | Meta description | AI-generated from name + position + team | Rich snippets |
| `/player/[id]` | JSON-LD `description` field | AI-generated | Knowledge panel |
| `/match/[id]` | Match preview (above stats) | AI-generated at build time | Fresh content, long-tail |
| `/leagues/[id]` | League overview | AI-generated static + season update | Authority content |
| Index pages | H1 / meta descriptions | AI-generated per letter | Unique content per page |

### 5.5 Caching & Regeneration Strategy

```
Cache Strategy:
- Player bio: Generated once, cached forever (players rarely change bio text)
- Team description: Generated once, cached forever
- Match preview: Generated 24h before match, cached 48h
- Season content: Generated at season start, cached 1 year

Regeneration:
- Build-time batch job generates all player + team content
- 5000 players × 150 tokens × $0.15/1M tokens ≈ $0.11 total
- 200 teams × 100 tokens ≈ $0.003 total
- Total: ~$0.15 for full content generation at build
```

---

## Phase 6 — Build & Deploy Pipeline

### 6.1 Build Script

```json
// package.json
{
  "scripts": {
    "build:generate": "npx tsx scripts/generate-content.ts",
    "build:static": "npm run build:generate && next build",
    "postbuild": "node scripts/warm-cache.mjs"
  }
}
```

### 6.2 GitHub Actions / Vercel Post-Deploy

```yaml
# .github/workflows/post-deploy.yml
on:
  deployment_status:
    states: [success]

jobs:
  warm-and-submit:
    if: github.event.deployment_status.environment == 'production'
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST https://activesports.app/api/warm-cache
      - run: curl "https://www.google.com/ping?sitemap=https://activesports.app/sitemap.xml"
```

### 6.3 Build Time Budget

| Step | Estimated Time | Parallel? |
|------|---------------|-----------|
| API: fetch all team IDs | 2s | Yes (7 leagues) |
| API: fetch squad per team (200) | 30s | Yes (concurrency 10) |
| Content generation (5200 items) | 60s | Yes (concurrency 20) |
| Next.js build + SSG | 60s | — |
| Total | ~2.5 min | — |

Well within Vercel's 45-minute free tier build limit.

---

## Success Metrics

| Metric | Current | Target | Method |
|--------|---------|--------|--------|
| Indexed pages | ~30 | 5,000+ | Google Search Console |
| LCP | ~3s | <1.5s | Lighthouse / CrUX |
| Page load (median) | ~2.5s | <1s | Real User Monitoring |
| Sitemap URLs | 34 | 5,200+ | Sitemap index |
| Crawl rate | Low | High | GSC Crawl Stats |
| Organic traffic | 0 | Growing | Google Analytics |

---

## Implementation Order

```
Week 1 │ Phase 1: Bulk generateStaticParams (teams + players)
       │ Phase 2: Index pages (A-Z directories)
       │ Phase 3: Expanded sitemap index
       │
Week 2 │ Phase 4: Streaming Suspense + image optimization
       │ Phase 5: OpenRouter integration + content generation
       │ Phase 6: Build pipeline + cache warming
       │
Week 3 │ Monitoring: GSC submission, crawl analysis, LCP tracking
       │ Iteration: Fill gaps, fix thin content warnings
```

---

## OpenRouter Setup

To enable AI content generation, add to `.env.local`:

```
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

The key is used only at build time (not exposed to clients). All generated content is cached in the database to avoid regeneration costs.
