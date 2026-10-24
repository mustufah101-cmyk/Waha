---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Target Calculation Engine & Baseline Tests**
  Becomes usable: Pure mathematical engine and configuration asserting exact baseline targets (2.3 L Mild, 3.1 L Hot, 3.7 L Extreme+workout, with 2.31 L base line) verified by Vitest. Project scaffold included.
  Why now: The unique kernel begins with the transparent calculation engine; verifying the core math first eliminates regression risks for all UI slices.
  PRD ref: `prd.md > Features and Behavior > 1. Transparent Target Calculation Engine`
  Spec ref: `spec.md > Components > 1. Configuration`, `spec.md > Components > 2. Target Engine`
  Build: Run `git init`, initialize Vite + TypeScript project structure with self-hosted font, create `src/engine/engineConfig.ts`, implement `src/engine/targetCalculator.ts`, and create `src/engine/targetCalculator.test.ts`.
  Verify (mechanical): Run `npm run test` and confirm 100% assertions pass for 2.3 L, 3.1 L, 3.7 L, and the 2.31 L base breakdown.
  Learner check: Run `npm run test` and inspect the clean test output verifying your exact target formulas.
  Commit: `feat: target calculation engine with baseline unit tests`

- [x] **2. Target Display, Condition Controls & Basic Onboarding**
  Becomes usable: A running web UI with basic onboarding screen (weight, outdoor time, safety disclaimer with required acknowledgment, "Start Oasis"), headline target in liters and cups, stacked breakdown lines explaining "+0.50 L Heat" and "+0.25 L Outdoors", and interactive condition pills (Mild/Hot/Extreme, workout toggle).
  Why now: Captures user profile immediately and puts the core "number changes and tells you why" demo moment on screen early.
  PRD ref: `prd.md > Screens and Layout > 1. Onboarding Modal`, `prd.md > Screens and Layout > 2. Main Hydration Screen`, `prd.md > Features and Behavior > 1. Transparent Target Calculation Engine`
  Spec ref: `spec.md > Components > 6. UI Components > TargetDisplay.ts`, `ConditionSelector.ts`, `SafetyModal.ts`, `spec.md > Look and Feel`
  Build: Implement `src/index.css` with Sand and Twilight design tokens, basic onboarding modal with required safety acknowledgment, `src/components/TargetDisplay.ts`, `src/components/ConditionSelector.ts`, and wire them in `src/main.ts` with local state.
  Verify (mechanical): Start dev server, confirm it builds without errors, and verify DOM renders onboarding modal, target display, and condition pills.
  Learner check: Open http://localhost:5173, complete the onboarding setup with safety acknowledgment, click "Hot" then "Extreme + 30m", and watch the target roll up from 2.3 L to 3.1 L and 3.7 L with transparent breakdown tags.
  Commit: `feat: target display, condition controls, and basic onboarding`

- [x] **3. One-Tap Logging, Liquid Wave & Static Deployment**
  Becomes usable: Tap the large 250 ml button or 150/500 ml presets to log water intake, see the canvas sinusoidal liquid wave fill rise with ARIA progressbar updates, use 5-second undo toast, and verify static deployment build (`dist/` ready for GitHub Pages / Netlify).
  Why now: Completes the physical logging loop and establishes a working deployed static URL early in the build.
  PRD ref: `prd.md > Features and Behavior > 2. One-Tap Logging & Liquid Progress`
  Spec ref: `spec.md > Components > 4. Liquid Progress Vessel`, `spec.md > Components > 5. Hero Logging Controls`, `spec.md > Accessibility Requirements`, `spec.md > Where It Runs and How Someone Tries It > Build & Deploy`
  Build: Implement `src/components/LiquidProgress.ts` (canvas sinusoidal wave with reduced-motion fallback and ARIA semantics), `src/components/LogControls.ts` (hero button, presets, undo toast), state log management in `src/state/store.ts`, and static build deployment setup.
  Verify (mechanical): Run unit tests for store logging and undo; run `npm run build` to verify clean static bundle generation with zero errors.
  Learner check: Tap "+250 ml" three times, observe the wave animating upward and remaining liters decrementing, test "Undo", and inspect the production build output.
  Commit: `feat: one-tap logging, undo toast, liquid wave, and static deployment`

- [x] **4. Ramadan Scheduler, Spaced Checkpoints, Twilight Theme & Demo Override**
  Becomes usable: Ramadan mode toggle switching to twilight theme, pure scheduler with rolling 60-min 0.75 L cap, property test (1.5–4.5 L sweep asserting scheduled volume = min(target, windowCap) for short windows), and URL demo-clock override (`?now=HH:mm`) for camera-ready demo recording.
  Why now: Completes the second pillar of the unique kernel. Placed here so a full draft demo video can be recorded right away.
  PRD ref: `prd.md > Features and Behavior > 3. Ramadan Evening Scheduler ("Redistribute, Don't Fail")`
  Spec ref: `spec.md > Components > 3. Ramadan Scheduler`, `spec.md > Components > 6. UI Components > RamadanScheduleView.ts`, `spec.md > Unit & Property Test Verification Plan`
  Build: Implement `src/engine/ramadanScheduler.ts`, `src/engine/ramadanScheduler.test.ts` (0.612 L, 0.74 L, 90 kg clamp, window cap assertion, and 1.5–4.5 L property sweep), `src/components/RamadanScheduleView.ts`, and wire `?now=HH:mm` clock injection in `src/main.ts`.
  Verify (mechanical): `npm run test` passes all Ramadan tests and the property sweep; verify opening with `?now=19:00` renders night mode checkpoints.
  Learner check: Append `?now=19:00` to the URL, toggle Ramadan mode, inspect the twilight theme and spaced checkpoints, and record the draft demo video.
  Commit: `feat: ramadan scheduler, checkpoints, twilight theme, and demo clock override`

- [ ] **5. Derived Streak, History Strip, and About Safety Modal**
  Becomes usable: Streak calculation derived from history (≥90% of unrounded effective target), next-iftar rollover via `dateKey.ts`, 7-day visual history strip, and persistent About modal with safety disclaimers and principles.
  Why now: Completes the remaining P0 journey, long-term retention loop, and permanent safety compliance reference.
  PRD ref: `prd.md > Features and Behavior > 4. Streak & 7-Day History`, `prd.md > Features and Behavior > 5. Safety Disclaimer`, `prd.md > Screens and Layout > 4. About & Safety Modal`
  Spec ref: `spec.md > Components > 4. Date Key & Day Boundary`, `spec.md > Components > 5. State Store`, `spec.md > Components > 8. HistoryStrip.ts`, `spec.md > Components > 9. SafetyModal.ts`
  Build: Implement `src/engine/dateKey.ts`, `src/engine/dateKey.test.ts`, `src/components/HistoryStrip.ts`, persistent About safety modal, and wire derived streaks in `src/state/store.ts`.
  Verify (mechanical): Vitest tests for dateKey and derived streak passing; verify About modal opens cleanly from header.
  Learner check: Open the running app, view the streak badge and 7-day strip, open the About modal to verify safety disclaimers, and test the full core journey.
  Commit: `feat: streak tracking, 7-day history strip, and about safety modal`

- [ ] **6. P1 Enhancements: Share Card & Friend Challenge**
  Becomes usable: Client-side canvas share card generator and serverless URL friend challenge.
  Why now: Delivered after the draft demo is recorded and the deployed build is verified, adding stretch social polish without risk to the core submission.
  PRD ref: `prd.md > Deferred From the POC`
  Spec ref: `spec.md > Decisions and Open Issues`
  Build: Implement client-side canvas share card exporter and URL-encoded friend challenge reader/comparator.
  Verify (mechanical): Test share card generation produces a valid PNG data URL; verify challenge URL parsing works with mock query parameters.
  Learner check: Click "Share Card" to export your daily achievement, copy a challenge link, and test in an incognito window.
  Commit: `feat: share card generator and serverless friend challenge`

## Hands-on Checkpoints

- [x] Early usable behavior explored — Slice 2 (Onboarding and "number changes and tells you why" dynamic stacking)
- [x] Static deployment verified — Slice 3 (Live production bundle)
- [x] Draft demo video recorded — Slice 4 (Ramadan evening mode with `?now=HH:mm` override)
- [ ] Final kick-the-tires exploration and feedback completed — Slice 5 (Complete P0 core journey)

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions

