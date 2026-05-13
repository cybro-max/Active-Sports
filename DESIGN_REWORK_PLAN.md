# ActiveSports — Comprehensive UI Redesign Plan

## 1. Overview & Vision
The current ActiveSports UI looks basic and "generic." We are completely abandoning the existing white/blue aesthetic.
This plan outlines the transition to **"Midnight Pitch"** — a dark-first, premium sports aesthetic inspired by industry leaders like ESPN, FotMob, and Sofascore. It aims to deliver a visually stunning, immersive, and highly responsive UI that utilizes the full width of modern PC displays.

### Key Features
- **Dark-First Ecosystem**: A dark carbon base with electric neon-green accents. High contrast, energetic, and premium.
- **Glassmorphism**: Frosted glass cards with subtle borders and backdrop blur.
- **Dynamic Layout**: `max-w-screen-2xl` (1536px) instead of `max-w-7xl` (1280px) to maximize screen real estate on large monitors.
- **Typography Overhaul**: `Space Grotesk` for numbers and headlines (bold, technical feel); `Inter` for highly readable body copy.
- **Micro-Interactions**: Hover lifts, shimmer skeletons, fade-ins, and glowing pulse effects for live matches.

---

## 2. Design System Tokens (The "Midnight Pitch" Palette)

The new CSS variables that will be defined in `globals.css`:

| Token | Value | Purpose |
|---|---|---|
| `--bg-base` | `#0A0D12` | Page background (near-black) |
| `--bg-surface` | `#111418` | Card surfaces |
| `--bg-elevated` | `#1A1F27` | Elevated panels, modals |
| `--bg-hover` | `#22293A` | Hover states |
| `--brand` | `#00E676` | Primary CTA, live dots (neon green) |
| `--brand-dim` | `rgba(0,230,118,0.12)` | Brand tint backgrounds |
| `--accent` | `#00B0FF` | Secondary accent (electric blue) |
| `--accent-dim` | `rgba(0,176,255,0.12)` | Accent tint backgrounds |
| `--live` | `#FF3D57` | Live match indicators |
| `--live-dim` | `rgba(255,61,87,0.15)` | Live tint |
| `--success` | `#00E676` | Wins |
| `--warning` | `#FFB300` | Draws/pending |
| `--danger` | `#FF3D57` | Losses/errors |
| `--border` | `rgba(255,255,255,0.06)` | Subtle borders |
| `--border-strong` | `rgba(255,255,255,0.12)` | Stronger dividers |
| `--text-primary` | `#FFFFFF` | Headings |
| `--text-body` | `#C8D0DC` | Body copy |
| `--text-muted` | `#6B7A8D` | Secondary/meta text |

---

## 3. Global CSS & Layout Architecture

### `globals.css`
- **Typography Integration**: Import `Space Grotesk` from Google Fonts.
- **Component Classes**: Define new `.glass-card`, `.neon-badge`, `.pulse-live`, `.score-display` utilities.
- **Animations**: Add keyframes for `fadeSlideUp`, `glowPulse`, and `shimmer`.
- **Theme Override**: Remove the bright white light mode completely. Provide a highly polished dark-only or extremely dark-tinted palette.

### `layout.tsx`
- **Font Implementation**: Apply `Space Grotesk` and `Inter` via next/font.
- **Container Structure**: Update `max-w-7xl` to `max-w-screen-2xl` for the main wrapper.
- **Footer**: Redesign into a dark, multi-column footer with crisp branding.

---

## 4. Component-by-Component Redesign Strategy

### 1. Navbar (`Navbar.tsx`)
- **Style**: Floating glassmorphism bar (`backdrop-blur-xl bg-[var(--bg-surface)]/80`).
- **Logo**: Bold "AS" wordmark with a neon-green glowing dot indicator.
- **Navigation**: Pill-style nav links. Active states get a neon-green glowing underline or background tint.
- **Search**: Expandable search bar with a realistic placeholder.

### 2. Home Page (`app/page.tsx`)
- **Hero Section**: Dark gradient backdrop with a massive, bold "Live Scores" heading in Space Grotesk. Animated live stats ticker.
- **Layout**: Switch to a wider main area (3/4 width) and sidebar (1/4 width) on PC.
- **Sidebar**: Dark glass cards for Major Leagues, Trending, and World Cup Promos.

### 3. Match Card (`MatchCard.tsx`)
- **Container**: Dark glass card with a subtle hover border glow (electric blue or neon green).
- **Typography**: Large score numbers in `Space Grotesk` tabular numerals.
- **Assets**: Upscale team logos to 32px (from 24px) for better visual weight.
- **Live State**: Red pulsing indicator (`glowPulse`) and an animated "LIVE" badge.
- **Win Bar**: At full-time, display a smooth gradient bar beneath the winning team.

### 4. Search Overlay (`SearchOverlay.tsx`)
- **Modal**: Full-screen frosted glass (`backdrop-blur-md`).
- **Input**: Massive search input with neon underline on focus.
- **Results**: Rich hover states, distinct category pills, and sleek thumbnail integration.
- **UX**: Keyboard hint bar at the bottom with stylized key chips.

### 5. Standings Table (`StandingsTable.tsx`)
- **Row Styling**: Dark striped rows with alternating `bg-[var(--bg-elevated)]`.
- **Rank Indicators**: Neon green for Champions League, amber for Europa, red for relegation zones.
- **Form Pills**: Rounded pills with a pronounced glowing effect on "W".

### 6. Odds Components (`OddsTable.tsx`, `OutrightOddsTable.tsx`)
- **Cards**: Dark card table with neon odds values.
- **Highlights**: Best odds highlighted with a subtle green glow.
- **Outright**: Podium-style ranking (gold/silver/bronze rank badges) with an animated implied probability bar (neon green gradient).

### 7. Interactive Elements (`PredictionWidget.tsx`, `FavoriteButton.tsx`)
- **Prediction Widget**: Dark glassmorphism card. Score inputs use large bold numerals on a dark surface with a neon ring on focus. Submit button gets a full neon green fill with an outer glow.
- **Favorite Button**: When favorited, transitions to a hot-pink (`#f43f5e`) glow with a scale bounce animation.

### 8. World Cup / Knockout Components
- **Countdown (`WorldCupCountdown.tsx`)**: Time units displayed in dark glass tiles. `Space Grotesk` tabular numerals. Trophy icon pulsing gold when the event is live.
- **Bracket (`KnockoutBracket.tsx`)**: Dark bracket cards. Winner slots get a neon green glow. The final round gets a gold border and amber background tint.

### 9. Admin Dashboard (`app/admin/page.tsx`, `AdminQuotaChart.tsx`)
- **Header**: Terminal-style header with a monospace admin badge.
- **Cards**: Dark glass container with a Recharts donut chart using neon green (normal) to red (danger) gradients.
- **Status Lines**: Rows with glowing online dots.

### 10. Utility Components (`Skeleton.tsx`, `FallbackState.tsx`)
- **Skeleton**: Dark shimmer skeletons. Base is dark carbon, shimmer is a slightly lighter dark grey wave.
- **Fallback State**: Red-tinted glass for errors, muted glass for empty states, blue-tinted for informational states.

---

## 5. Execution Plan

The execution will follow a sequential path to ensure stability:
1.  **Foundation**: Update `globals.css` with the "Midnight Pitch" palette and utilities. Update `layout.tsx` for fonts and widths.
2.  **Core Shell**: Redesign `Navbar.tsx` and the `Footer` structure.
3.  **Data Display**: Revamp `MatchCard.tsx`, `StandingsTable.tsx`, and `OddsTable.tsx`.
4.  **Interactive**: Update `SearchOverlay.tsx`, `PredictionWidget.tsx`, and `FavoriteButton.tsx`.
5.  **Page Layouts**: Adjust `page.tsx` (Home), Leagues, Leaderboard, and Admin pages to use the new `max-w-screen-2xl` layout and dark theme nuances.
6.  **Polish**: Apply `Skeleton.tsx` updates and review responsive breakpoints.

**All ready to begin executing Phase 1 upon confirmation!**
