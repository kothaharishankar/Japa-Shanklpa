# Japa Sankalpa – Development Progress (TODO)

## Phase 1: Project Inspection and Foundation
- [x] Inspect workspace and establish project structure <!-- id: 1.1 -->
- [x] Initialize Vite + React + TypeScript configuration <!-- id: 1.2 -->
- [x] Configure Tailwind CSS with devotional color palette and fonts <!-- id: 1.3 -->
- [x] Create Dexie.js IndexedDB schema and database provider <!-- id: 1.4 -->
- [x] Set up base application layout, shell, and responsive routing/navigation <!-- id: 1.5 -->

## Phase 2: Main Interface & Navigation
- [x] Build navigation system (Mobile bottom nav, Desktop responsive nav) <!-- id: 2.1 -->
- [x] Build Home Dashboard with live statistics, circular progress, and quick actions <!-- id: 2.2 -->
- [x] Build Settings screen structure with preference controls <!-- id: 2.3 -->

## Phase 3: Digital Japa Counter
- [x] Build 108-bead Mala visualization (circular/spiral layout with accurate bead status) <!-- id: 3.1 -->
- [x] Implement robust one-tap counter with rapid-tap protection <!-- id: 3.2 -->
- [x] Implement undo repetition functionality <!-- id: 3.3 -->
- [x] Implement session management (start, pause, resume, finish, timing) <!-- id: 3.4 -->
- [x] Add sound and haptic vibration feedback with wake-lock <!-- id: 3.5 -->
- [x] Add full-screen distraction-free mode <!-- id: 3.6 -->
- [x] Guarantee atomic IndexedDB persistence and recovery <!-- id: 3.7 -->

## Phase 4: Fixed 11 Lakh Sankalpa & Smart Calculator
- [x] Implement fixed 11,00,000 target view and progress ring <!-- id: 4.1 -->
- [x] Smart Daily Target Calculator (30, 90, 180, 365, custom deadline presets) <!-- id: 4.2 -->
- [x] Milestones tracking & one-time celebrations (10k, 50k, 1L, 2.5L, 5L, 7.5L, 10L, 11L) <!-- id: 4.3 -->
- [x] Daily Goal setting and independent tracking <!-- id: 4.4 -->

## Phase 5: Calendar and Analytics
- [x] Monthly calendar with activity indicators and date selection modal/details <!-- id: 5.1 -->
- [x] Activity heatmap with 5-tier green shading <!-- id: 5.2 -->
- [x] Analytics dashboard with daily, weekly, monthly, and lifetime metrics <!-- id: 5.3 -->
- [x] Responsive Recharts visualizations <!-- id: 5.4 -->

## Phase 6: Mantra Library & Multilingual Support
- [x] 6 Default sacred mantras + custom mantra creation and editing <!-- id: 6.1 -->
- [x] Mantra-wise statistics aggregation <!-- id: 6.2 -->
- [x] i18n architecture with en.json, te.json, hi.json <!-- id: 6.3 -->
- [x] Language switcher and font rendering <!-- id: 6.4 -->

## Phase 7: Data Safety: Export & Restore My Japa Data
- [x] "Export My Japa Data" JSON generator (complete schema) <!-- id: 7.1 -->
- [x] CSV exports for daily summaries and sessions <!-- id: 7.2 -->
- [x] "Restore My Japa Data" parser, multi-step validator, and preview <!-- id: 7.3 -->
- [x] Safe restore with pre-restore backup & atomic IndexedDB transaction <!-- id: 7.4 -->

## Phase 8: PWA & Offline Support
- [x] Web app manifest, theme colors, and devotional icons <!-- id: 8.1 -->
- [x] Service worker with offline asset caching <!-- id: 8.2 -->
- [x] PWA installation prompt & iOS instructions <!-- id: 8.3 -->
- [x] Offline status banner / indicator <!-- id: 8.4 -->

## Phase 9: Testing, Verification & Production Build
- [x] TypeScript check and production build (`npm run build`) <!-- id: 9.1 -->
- [x] Counter math validation (11,00,000 / 108 = 10,185 malas + 20 repetitions) <!-- id: 9.2 -->
- [x] Export/Restore test verification <!-- id: 9.3 -->
- [x] Cloudflare Pages deployment readiness <!-- id: 9.4 -->
