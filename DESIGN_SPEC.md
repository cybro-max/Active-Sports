# Design Specification — ActiveSports Visual Overhaul

## Overview
Transition from the current dark/glass aesthetic to a sophisticated **Modern Minimalist** design following Flat Design 2.0 principles. Clean, intentional, and professional — avoiding generic AI-generated patterns.

---

## 1. Color Palette (3 Harmonious Colors)

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#0F172A` | Headlines, primary text, high-emphasis elements |
| **Brand** | `#1E40AF` | Primary buttons, active states, key interactive elements |
| **Accent** | `#06B6D4` | Highlights, live indicators, secondary interactive cues |
| **Neutral 50** | `#F8FAFC` | Page background |
| **Neutral 100** | `#F1F5F9` | Card/surface backgrounds |
| **Neutral 200** | `#E2E8F0` | Borders, dividers |
| **Neutral 500** | `#64748B` | Secondary text, muted labels |
| **Neutral 700** | `#334155` | Body text |
| **White** | `#FFFFFF` | Elevated surfaces, modals, dropdowns |
| **Success** | `#059669` | Wins, positive indicators |
| **Danger** | `#DC2626` | Losses, errors |
| **Warning** | `#D97706` | Draws, pending states |

**Rule:** Never use gradients for depth. Use soft shadows (box-shadow) instead.

---

## 2. Typography

| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| H1 | Inter | 700 | 2.25rem (36px) | 2.5rem |
| H2 | Inter | 700 | 1.5rem (24px) | 2rem |
| H3 | Inter | 600 | 1.125rem (18px) | 1.5rem |
| H4 | Inter | 600 | 1rem (16px) | 1.5rem |
| Body | Inter | 400 | 0.875rem (14px) | 1.5rem |
| Small | Inter | 400 | 0.75rem (12px) | 1.25rem |
| Caption | Inter | 500 | 0.6875rem (11px) | 1rem |
| Button | Inter | 600 | 0.875rem (14px) | 1.25rem |
| Score | Inter | 800 | 1.75rem (28px) | 2rem |

**Hierarchy strategy:** Use font weight and size to communicate importance — NOT color changes between elements at the same level.

---

## 3. Component Design

### Cards
- Background: `#FFFFFF` (white)
- Border: 1px solid `#E2E8F0`
- Border-radius: `8px`
- Padding: `20px` (p-5)
- Shadow: `0 1px 3px rgba(15, 23, 42, 0.06)` (subtle elevation)
- Hover: `0 4px 12px rgba(15, 23, 42, 0.08)` + translateY(-1px)
- Transition: 0.2s ease

### Buttons
- **Primary:** Background `#1E40AF`, text white, radius `6px`, padding 10px 20px
  - Hover: Background `#1E3A8A`, shadow `0 2px 8px rgba(30, 64, 175, 0.25)`
  - Active: Background `#1D4ED8`
- **Secondary:** Background `#F1F5F9`, text `#334155`, border 1px `#E2E8F0`, radius `6px`
  - Hover: Background `#E2E8F0`
- **Ghost:** No background/border, text `#64748B`, radius `6px`
  - Hover: Background `#F1F5F9`

### Inputs & Search
- Background: `#FFFFFF`
- Border: 1px solid `#E2E8F0`, radius `6px`, padding 10px 14px
- Focus: Border `#1E40AF`, ring `0 0 0 3px rgba(30, 64, 175, 0.1)`
- Placeholder: `#94A3B8`

### Badges & Pills
- Radius: `4px` (not fully rounded pills)
- Padding: 2px 8px
- Font: 11px, weight 600, uppercase

### Tabs
- Inline with bottom border (`#E2E8F0`)
- Active: 2px solid `#1E40AF` bottom border
- Inactive: text `#64748B`

### Live Indicator
- Simple red dot: `#DC2626`, 6px, no animation pulse
- Cleaner, more professional than the current animated version

---

## 4. Layout & Grid

- **Max width:** `1280px` (max-w-7xl equivalent)
- **Page padding:** `px-4 sm:px-8 lg:px-12 py-8`
- **Content grid:** 2-column layout (main content 2/3, sidebar 1/3)
- **Vertical rhythm:** `space-y-6` between sections, `space-y-4` between items
- **Section gap:** `gap-8` between grid columns
- **Whitespace:** 24px (p-6) minimum between distinct content sections

---

## 5. Shadows (Soft Elevation)

| Level | Usage | Value |
|-------|-------|-------|
| sm | Cards, surfaces | `0 1px 2px rgba(15, 23, 42, 0.06)` |
| md | Hover states, dropdowns | `0 4px 12px rgba(15, 23, 42, 0.08)` |
| lg | Modals, overlays | `0 8px 24px rgba(15, 23, 42, 0.12)` |

---

## 6. Animations & Micro-interactions

- **Card hover:** `transform: translateY(-1px); box-shadow: 0 4px 12px ...` (0.2s ease)
- **Button click:** `transform: scale(0.98)` (0.1s ease)
- **Page entry:** `fadeUp` animation (0.4s ease, staggered)
- **Link hover:** Color change only, no background shifts
- **Skeleton shimmer:** Soft gradient sweep (not the bright current version)
- **Status transitions:** Background color shifts for live/FT updates

---

## 7. Mobile Adaptations

- Single column grid on mobile (< 768px)
- Hamburger menu retains current structure but restyled
- Cards full-width on mobile with reduced padding (16px)
- Touch targets ≥ 44px
- Bottom sheet for filters/overlays

---

## Implementation Checklist

- [x] Rewrite `globals.css` with new design tokens
- [ ] Update `layout.tsx` — remove dark class, update font strategy
- [ ] Restyle `Navbar.tsx` — clean light navigation
- [ ] Update `MatchCard.tsx` — refined card, better spacing
- [ ] Redesign `app/page.tsx` — home hero, layout, sidebar
- [ ] Update `app/leagues/[id]/page.tsx`
- [ ] Update `app/team/[id]/page.tsx`
- [ ] Update `app/player/[id]/page.tsx`
- [ ] Update `app/match/[id]/page.tsx`
- [ ] Update remaining components (StandingsTable, PredictionWidget, etc.)
- [ ] Update leftover pages (favorites, search, world-cup, etc.)