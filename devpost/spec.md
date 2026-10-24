---
doc: spec
status: approved
---

# Waha — Technical Specification

## How This Works, In Plain Language
Waha is a lightweight, zero-backend, client-side web application running completely in the browser with no network needed after load. It stores user profile settings and daily hydration logs in the browser's `localStorage`.

The application is structured into four focused parts:
1. **The Target Engine:** A pure, deterministic mathematical module that accepts user weight, heat condition (Mild, Hot, Extreme), outdoor exposure (Indoors, Mixed, Outdoors), and workout minutes, and outputs the unrounded daily target along with stacked explanation lines. The baseline displays as 2.31 L (for 70 kg) so the breakdown numbers sum cleanly to the headline target. All multipliers, constants, and bounds live in one centralized configuration file (`engineConfig.ts`).
2. **The Ramadan Scheduler:** A pure scheduling function that calculates an evening drinking timeline between iftar and suhoor scheduled directly from the unrounded target. It enforces a strict safety cap of no more than 0.75 L across any rolling 60 minutes by spacing checkpoints. Block durations are derived deterministically from the window length using fixed ratios and the 20/40/15/25 split in `engineConfig.ts`. If the window is too short, the effective target is `min(target, windowCap)`, which drives both the display and streak check, while any volume that cannot safely fit stays unscheduled with an informational badge and no failure messages.
3. **The Local State Store:** A state management layer with an injectable clock (`now: Date`), supporting an optional demo-clock override via URL parameter (`?now=HH:mm`). A hydration day runs from iftar to the next iftar. Toggling Ramadan mode never re-keys the active day, and editing the iftar time never alters the active day's rollover—it only shifts the next boundary. `streakCount` is derived directly from history (days with no record count as misses).
4. **The UI Layer:** A responsive, accessible mobile-first interface featuring an animated liquid wave progress container with ARIA progressbar semantics, reduced-motion fallbacks, WCAG AA 4.5:1 contrast, one-tap quick log buttons (with 5-second undo), heat/workout selectors, and a twilight Ramadan view.

## The Core Journey Through the System
Traced from `prd.md > The Core Journey`:
1. **First-run Onboarding:**
   - User loads `index.html`.
   - Store checks `localStorage.getItem('waha_profile')`. If null, it displays `OnboardingModal`.
   - User enters weight (70 kg), selects outdoor exposure (Mixed), reads the safety disclaimer, and clicks "Start Oasis".
   - Store saves profile to `localStorage`, calculates baseline target via Target Engine, and dismisses modal.
2. **Target Display & Adjustments:**
   - Main screen renders current target: 2.3 L (Mild display, with baseline breakdown showing 2.31 L).
   - User taps "Hot" pill → Store updates condition → Target recalculates to 3.1 L with stacked breakdown tags (`+0.50 L Heat`, `+0.25 L Outdoors`).
   - User toggles `+30 min workout` and "Extreme" → Target rolls up to 3.7 L.
3. **One-Tap Logging & Liquid Fill:**
   - User taps `250 ml` button.
   - Store appends entry `{ timestamp: now.getTime(), amountMl: 250 }` to today's record in `localStorage`.
   - Liquid canvas wave updates fill height smoothly and updates `aria-valuenow`.
   - Undo toast mounts for 5 seconds; tapping Undo reverts the last entry.
4. **Goal Reached:**
   - Once total logged reaches 100% of effective target, UI triggers celebration burst (skipped if `prefers-reduced-motion` is active).
5. **Ramadan Mode Activation:**
   - User toggles "Ramadan Mode".
   - Theme switches dynamically to twilight palette (`[data-theme="twilight"]`). Active day key is strictly preserved; the next boundary is computed from the active day's start.
   - Injectable clock determines whether current time is in daylight fasting or evening drinking window. Reviewers can pass `?now=19:00` in the URL to immediately view the evening state without waiting for sunset or storing demo flags.
   - Checkpoints display spaced drinking targets scheduled from the unrounded target and capped at 0.75 L per rolling 60 minutes.
   - If window is constrained, an informational badge displays the safe capacity, and `effectiveTarget = min(target, windowCap)` drives the progress visual and streak goal.
6. **Day Rollover & Streak Tracking:**
   - `dateKey.ts` determines the active day boundary (iftar to next iftar). Editing the iftar time only shifts future boundaries and never alters the active day's rollover.
   - Streak is derived from history: counts consecutive past days meeting `totalLogged >= 0.90 * unroundedEffectiveTarget`. Days with no record count as misses.

## Stack
- **Runtime:** Browser (modern Chromium, Safari, Firefox, Edge). No network needed after load.
- **Core Technology:** HTML5, Vanilla TypeScript / JavaScript (ES modules), Vanilla CSS3 (Custom Properties & Canvas for wave animation).
- **Bundler & Dev Server:** Vite (`v5.x`) — rapid HMR, zero configuration overhead, clean static output.
- **Testing Runner:** Vitest — executes unit tests and property sweeps in milliseconds.
- **Typography:** Self-hosted modern sans-serif web font (WOFF2 bundled in `public/fonts/`, Outfit) ensuring zero CDN requests and no network dependency after load.
- **Accessibility:** Semantic HTML, ARIA progressbar roles, WCAG AA contrast (≥4.5:1), and `prefers-reduced-motion` media query support.

## Where It Runs and How Someone Tries It
- **Local Development & Demo:**
  - Node.js `v18+` or `v20+` installed.
  - Run `npm install` followed by `npm run dev`.
  - Opens locally at `http://localhost:5173`.
  - Append `?now=19:00` to inspect Ramadan evening mode at any hour.
- **Automated Verification:**
  - Run `npm run test` to run Vitest asserting the exact demo numbers, Ramadan allocations, edge-case clamps, and the 1.5–4.5 L property sweep.
- **Build & Deploy:**
  - Build command: `npm run build` (outputs optimized static bundle to `dist/`).
  - Deployable to any static host (GitHub Pages, Vercel, Netlify) with zero runtime server requirements.
- **Hackathon Submission:**
  - Public GitHub repository containing source code and `devpost/` planning artifacts (`scope.md`, `prd.md`, `spec.md`, `checklist.md`).
  - Recorded 1-3 minute video walkthrough demonstrated directly from the local browser.

## Look and Feel
Carried forward from `prd.md > Look and Feel`:
- **Theme Variables (CSS Custom Properties):**
  - `--bg-primary`: Sand Light (`#FAF6F0`) / Twilight Navy (`#0F172A`).
  - `--bg-surface`: Warm Card White (`#FFFFFF`) / Twilight Card (`#1E293B`).
  - `--accent-oasis`: Teal (`#0D9488` / `#14B8A6`) / Luminous Cyan (`#38BDF8`).
  - `--accent-gold`: Desert Amber (`#D97706`) / Ramadan Crescent Gold (`#F59E0B`).
  - `--text-primary`: Deep Slate (`#1E293B`) / Soft White (`#F8FAFC`).
  - `--text-secondary`: Muted Slate (`#64748B`) / Twilight Muted (`#94A3B8`).
- **Typography:** Clean, geometric sans-serif (Outfit, self-hosted WOFF2). Tabular numeric display (`font-variant-numeric: tabular-nums`) for targets, timers, and progress counters.
- **Micro-Animations:**
  - Sinusoidal wave animation for liquid progress container.
  - Smooth 200ms numeric roll-up transitions on condition changes.
  - Responsive button tap scales (`transform: scale(0.97)`).
  - Celebration particle burst on goal completion.

## Accessibility Requirements
- **Progress Visual:** Container element has `role="progressbar"`, `aria-valuenow="[currentPercent]"`, `aria-valuemin="0"`, `aria-valuemax="100"`, and text alternative `aria-label="Hydration progress: [logged] of [target] liters ([percent]%)"`.
- **Reduced Motion:** When `prefers-reduced-motion: reduce` is detected:
  - Sinusoidal wave motion is disabled; canvas renders a clean, static horizontal water level.
  - Confetti/particle celebration effects are suppressed; replaced by an accessible static celebratory badge.
  - Numeric transitions update immediately without animated roll-ups.
- **Buttons and Controls:** All icon-only and preset buttons include explicit `aria-label` attributes (e.g. `aria-label="Log 250 milliliters"`, `aria-label="Undo last log"`).
- **Color Contrast:** All body text, button labels, and secondary indicators maintain a contrast ratio of at least 4.5:1 against their respective backgrounds in both Sand and Twilight themes.

## Components

### 1. Configuration (`src/engine/engineConfig.ts`)
- Central single source of truth:
  - Baseline weight multiplier: `0.033` L/kg.
  - Heat additions: Mild (`0.0`), Hot (`0.50`), Extreme (`0.80`).
  - Outdoor additions: Indoors (`0.0`), Mixed (`0.25`), Mostly Outdoors (`0.50`).
  - Workout addition: `0.35` L per 30 minutes.
  - Minimum target: `1.5` L; Maximum target: `4.5` L.
  - Ramadan split ratios: Iftar (`0.20`), Evening/Post-Meal (`0.40`), Night Sips (`0.15`), Suhoor (`0.25`).
  - Rolling hourly cap: `0.75` L per 60 minutes.
  - Fixed block duration ratios derived from window length:
    - Iftar block: `min(60 min, windowLength * 0.125)`
    - Evening block: `windowLength * 0.45`
    - Night sips: `windowLength * 0.25`
    - Suhoor block: `windowLength * 0.175`

### 2. Target Engine (`src/engine/targetCalculator.ts`)
Implements `prd.md > 1. Transparent Target Calculation Engine`.
- Pure function `calculateDailyTarget(profile: UserProfile, conditions: DayConditions): TargetResult`.
- Calculates baseline `weightKg * 0.033` (e.g. 70 kg -> 2.31 L).
- Calculates additions: heat, outdoor exposure, workout.
- Headline target is rounded to 0.1 L for display, but unrounded target is preserved for scheduling and streak checks.
- Returns `{ unroundedTargetL, displayTargetL, baseTargetL, heatAdditionL, outdoorAdditionL, workoutAdditionL, breakdownLines: string[] }`.

### 3. Ramadan Scheduler (`src/engine/ramadanScheduler.ts`)
Implements `prd.md > 3. Ramadan Evening Scheduler`.
- Pure function `generateRamadanSchedule(unroundedTargetL: number, windowConfig: WindowConfig, loggedEntries: LogEntry[], now: Date): RamadanSchedule`.
- Calculates allocations directly from `unroundedTargetL` using split ratios (20% iftar, 40% evening, 15% night, 25% suhoor).
- Enforces rolling 60-min cap: no 60-minute window exceeds 0.75 L by spacing checkpoints.
- Clamps iftar allocation to 0.75 L if uncapped share > 0.75 L, pushing remainder to evening block.
- In a too-short window: `effectiveTarget = Math.min(unroundedTargetL, windowHours * 0.75)`. Any volume exceeding the safe capacity remains unscheduled, accompanied by an informational badge (e.g. "Safe Window Target: X L") and never an error message.
- Redistributes unconsumed water from past blocks forward across remaining active blocks.

### 4. Date Key & Day Boundary (`src/engine/dateKey.ts`)
- Pure function `getHydrationDateKey(timestamp: number, iftarTime: string): string`.
- Omits `ramadanMode` parameter: the date key is computed consistently based on the iftar boundary so toggling Ramadan mode never re-keys the active day.
- Hydration day runs from iftar to next iftar. Timestamps between iftar and next iftar belong to that iftar cycle's date key.
- Editing the iftar time never triggers or alters the active day's rollover; it only shifts the next boundary. After a mode toggle, the next boundary is computed from the active day's start.

### 5. State Store & Local Storage Repository (`src/state/store.ts`)
Implements `prd.md > States and Boundaries`.
- Accepts injectable `now: Date`, initialized with URL parameter `?now=HH:mm` if present, falling back to system clock.
- Manages state: `profile`, `todayConditions`, `entries`, `ramadanMode`.
- Automatically persists to `localStorage` under `waha_state_v1`.
- Derives `streakCount` dynamically by traversing past history keys sequentially: a day is a hit if `totalLogged >= 0.90 * unroundedEffectiveTarget`. Days with no record count as misses.

### 6. UI Components
- `Header.ts`: Brand mark, derived streak badge, Ramadan toggle, About modal trigger.
- `TargetDisplay.ts`: Headline target in liters/cups, stacked breakdown lines (showing 2.31 L base so sum matches headline).
- `LiquidProgress.ts`: Canvas sinusoidal wave fill with `role="progressbar"`, `aria-valuenow`, and reduced-motion fallback.
- `LogControls.ts`: One-tap 250 ml button, 150 ml/500 ml quick presets, and 5-second undo toast.
- `ConditionSelector.ts`: Mild/Hot/Extreme pills and 30m/60m workout toggles.
- `RamadanScheduleView.ts`: Daylight countdown timer, spaced evening checkpoints, and informational window-constrained safe target badge.
- `HistoryStrip.ts`: 7-day visual history strip (visual only).
- `SafetyModal.ts`: First-run profile setup and persistent About safety disclaimer.

## Data Model

```typescript
export interface UserProfile {
  weightKg: number;              // e.g. 70
  outdoorTime: 'indoors' | 'mixed' | 'outdoors';
  nickname?: string;
  onboardingCompleted: boolean;
}

export interface DayConditions {
  heat: 'mild' | 'hot' | 'extreme';
  workoutMinutes: number;        // e.g. 0, 30, 60
}

export interface LogEntry {
  id: string;
  timestamp: number;
  amountMl: number;
}

export interface DayRecord {
  dateKey: string;               // YYYY-MM-DD
  profileSnapshot: UserProfile;
  conditions: DayConditions;
  unroundedTargetL: number;      // raw calculation
  effectiveTargetL: number;      // min(target, windowCap) in Ramadan mode
  displayTargetL: number;        // rounded for UI
  entries: LogEntry[];
  ramadanMode: boolean;
}

export interface WindowConfig {
  iftarTime: string;             // "HH:mm" e.g. "18:30"
  suhoorTime: string;            // "HH:mm" e.g. "05:00"
}

export interface RamadanCheckpoint {
  id: string;
  label: string;
  time: string;
  allocatedMl: number;
  consumedMl: number;
  isCurrent: boolean;
  isPast: boolean;
}

export interface WahaState {
  profile: UserProfile;
  conditions: DayConditions;
  windowConfig: WindowConfig;
  ramadanMode: boolean;
  todayEntries: LogEntry[];
  history: Record<string, DayRecord>; // past days indexed by dateKey
}
```

## File Structure

```
waha/
├── index.html                      # Entry HTML with self-hosted font preloads
├── package.json                    # Scripts (dev, build, test) and dependencies
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build config
├── public/
│   └── fonts/
│       ├── outfit-regular.woff2    # Self-hosted regular font
│       └── outfit-bold.woff2       # Self-hosted bold font
├── src/
│   ├── main.ts                     # App entry point, clock injection, DOM binding
│   ├── index.css                   # Design tokens, themes, layout, typography, contrast
│   ├── engine/
│   │   ├── engineConfig.ts         # Single config: multipliers, constants, split ratios
│   │   ├── targetCalculator.ts     # Target calculation engine
│   │   ├── targetCalculator.test.ts# Vitest tests asserting 2.3L, 3.1L, 3.7L
│   │   ├── ramadanScheduler.ts     # Ramadan distribution and 0.75L/hr spaced cap logic
│   │   ├── ramadanScheduler.test.ts# Vitest tests (0.612L, 0.74L, 90kg clamp, windowCap, & sweep)
│   │   ├── dateKey.ts              # Day boundary & rollover logic (iftar-to-iftar)
│   │   └── dateKey.test.ts         # Vitest unit tests for date boundaries
│   ├── state/
│   │   ├── store.ts                # State store, demo-clock override, derived streaks
│   │   └── storage.ts              # LocalStorage load/save with fallbacks
│   └── components/
│       ├── Header.ts               # Brand, derived streak, Ramadan toggle, About
│       ├── TargetDisplay.ts        # Target liters, cups, breakdown tags (2.31L base)
│       ├── LiquidProgress.ts       # Canvas wave fill, ARIA progressbar, reduced motion
│       ├── LogControls.ts          # One-tap button (250ml), presets (150/500ml), undo
│       ├── ConditionSelector.ts    # Mild/Hot/Extreme pills, workout toggle
│       ├── RamadanScheduleView.ts  # Countdown timer and spaced evening checkpoints
│       ├── HistoryStrip.ts         # 7-day visual history strip
│       └── SafetyModal.ts          # Onboarding setup and About safety disclaimer
└── devpost/
    ├── learner-profile.md          # Approved learner profile
    ├── scope.md                    # Approved scope document
    ├── prd.md                      # Approved product requirements document
    ├── spec.md                     # Technical blueprint (this file)
    └── checklist.md                # Build checklist
```

## External Services and Dependencies
- **External Services:** NONE. 100% offline, zero external APIs, zero database services, zero cloud auth.
- **NPM Dependencies:**
  - `vite` (dev): Development server and production bundler.
  - `typescript` (dev): Type checking.
  - `vitest` (dev): Fast unit testing runner and property test execution.

## Important Failure Modes
1. **`localStorage` Full, Disabled, or Private Browsing:**
   - *Failure:* `localStorage.setItem` throws `QuotaExceededError` or `SecurityError`.
   - *Fallback:* In-memory fallback state object so the app functions seamlessly for the active session without crashing.
2. **Shortened Fasting Window:**
   - *Failure:* User enters fasting window that is too short to safely accommodate the target under the 0.75 L/hr cap.
   - *Fallback:* `effectiveTarget` is automatically clamped to `min(unroundedTargetL, windowHours * 0.75)`. Scheduled volume matches this cap exactly; an informational badge notes the safe capacity, and no error message is displayed.
3. **Corrupted Stored State:**
   - *Failure:* JSON parse error on stored state from previous version.
   - *Fallback:* Safe parse with schema fallback that cleanly resets to default initial profile without crashing.

## What Was Simplified and Why
- **Local Deterministic Presets instead of Weather API:** Using Mild/Hot/Extreme selector instead of OpenWeather API avoids API key management, network failures, rate limiting, and guarantees consistent demo numbers.
- **Client-Side Storage instead of Firebase/Supabase:** Cuts authentication friction, setup time, and security rules; allows instant 30-second testing without login.
- **Self-Hosted WOFF2 Fonts instead of Google Fonts CDN:** Guarantees zero network latency, eliminates external font tracking, and requires no network after load.
- **Injectable Demo Clock (?now=HH:mm) instead of Persisted Flags:** Allows demoing evening states reliably by URL without polluting persisted state or relying on local system time.

## Decisions and Open Issues

### Decisions
1. **Day Boundary & Next-Iftar Rollover:**
   - *Choice:* Hydration day runs from iftar to the next iftar. `getHydrationDateKey(timestamp, iftarTime)` does not accept `ramadanMode`.
   - *Rationale:* Toggling Ramadan mode must never re-key the active day or move existing entries. Editing the iftar time only shifts future boundaries and never alters the active day's rollover.
2. **Derived Streaks from History:**
   - *Choice:* `streakCount` is not stored as an independent integer; it is derived dynamically from `history`. Days with no record count as misses.
   - *Rationale:* Eliminates synchronization drift between streak counters and recorded logs.
3. **Scheduling from Unrounded Target:**
   - *Choice:* Checkpoint volumes and block allocations are calculated directly from `unroundedTargetL`.
   - *Rationale:* Eliminates rounding accumulation errors across multiple checkpoints. Headline target display rounds to 0.1 L for clarity.
4. **Informational Constrained Window & Cap Test:**
   - *Choice:* When total window hours * 0.75 L < target, `effectiveTarget = min(target, windowCap)`. The scheduled volume equals this effective target, and an informational badge displays the safe capacity with no failure messages.
   - *Rationale:* Upholds physiological hydration pacing while preserving an encouraging user experience.
5. **Accessibility Semantics & Reduced Motion:**
   - *Choice:* Provide full ARIA progressbar semantics, text alternatives, WCAG AA 4.5:1 contrast, and reduced-motion fallbacks.
   - *Rationale:* Ensures universal usability and adherence to web accessibility standards.
6. **Removal of Activity Level:**
   - *Choice:* Removed `activityLevel` from profile inputs.
   - *Rationale:* Exercise adjustments are already captured cleanly and transparently by the workout toggle (+0.35 L per 30 minutes).

### Learning Moment (Next-Iftar Rollover & Boundary Decoupling)
- **Concept Explored:** How to handle overnight fasting schedules that cross midnight without splitting the user's hydration log across two calendar days or thrashing data keys when toggling modes.
- **Resolution:** By establishing the hydration day boundary at iftar (sunset) and decoupling `dateKey.ts` from `ramadanMode`, the active day's entries stay unified regardless of toggles. Furthermore, editing iftar time affects only the upcoming boundary rather than retroactively re-keying the current session, guaranteeing stable, deterministic local persistence.

### Unit & Property Test Verification Plan
- **Target Engine Test Cases (`targetCalculator.test.ts`):**
  - 70 kg, mixed outdoors, Mild -> 2.3 L (with 2.31 L base in breakdown).
  - 70 kg, mixed outdoors, Hot -> 3.1 L (+0.50 L heat, +0.25 L outdoor).
  - 70 kg, mixed outdoors, Extreme + 30m workout -> 3.7 L.
- **Ramadan Scheduler Test Cases (`ramadanScheduler.test.ts`):**
  - 70 kg Hot (3.06 L unrounded target): asserts exactly 0.612 L allocated at iftar (displayed as 0.61 L), no clamp.
  - 70 kg Extreme + 30 min (3.71 L unrounded target): asserts exactly 0.74 L allocated at iftar, no clamp.
  - 90 kg Extreme + 30 min (4.37 L unrounded target): asserts uncapped iftar share (0.874 L) strictly clamps to 0.75 L, pushing remainder to evening block.
  - Window Cap Test: Asserts that total scheduled volume equals `Math.min(unroundedTarget, windowCap)` in constrained windows.
  - Property test: Sweeps targets from 1.5 L to 4.5 L across varying window lengths, asserting that no rolling 60-minute window exceeds 0.75 L.
- **Date Key Test Cases (`dateKey.test.ts`):**
  - Asserts that timestamps before and after midnight within the same overnight fasting window share the same date key.
  - Asserts that editing iftar time does not alter the active day's key.
