---
doc: prd
status: approved
---

# Waha — Product Requirements

A personalized, heat-aware hydration tracker tailored to hot climates like Abu Dhabi and Ramadan fasting observers, delivering transparent daily targets and a thoughtful fasting drinking schedule with zero backend friction.
Source: `scope.md > Waha`, `scope.md > The Unique Kernel`.

## The Core Journey
1. **Arrival & Profile Setup (First Run):** The user opens Waha and sees a warm desert-sand interface. They complete a 30-second setup entering weight (kg), general activity level, outdoor exposure (Indoors / Mixed / Mostly Outdoors), and an optional nickname. A prominent safety disclaimer is presented and acknowledged.
2. **Personalized Target Display:** Upon landing on the main screen, the user immediately sees today's personalized target (displayed rounded to 0.1 L, with cup equivalent). Beneath it, stacked transparent reasoning lines explain the calculation (e.g. baseline for weight, heat bonus, outdoor bonus).
3. **Condition Adjustments:** The user toggles today's heat conditions (Mild / Hot / Extreme) or adds a workout (e.g. 30 minutes). The target and breakdown recalculate instantly with smooth numeric roll-ups.
4. **One-Tap Logging & Liquid Fill:** The user taps the prominent hero log button (default 250 ml) after drinking. The liquid wave graphic animates upward, and remaining water volume decrements. An instant "Undo" toast appears for 5 seconds. Quick presets (150 ml / 250 ml / 500 ml) allow alternative volumes.
5. **Goal Achievement Celebration:** Reaching 100% of the daily target triggers a celebratory visual animation and encouraging message.
6. **Ramadan Mode Pivot:** Toggling Ramadan mode transitions the UI into a calming twilight/night palette. During fasting daylight hours, the screen displays a countdown to iftar with logging controls de-emphasized. Editing the iftar time immediately switches the app to the night state so that live demos and testing do not depend on the real system clock.
7. **Evening Drinking Redistribution:** At night, the screen reveals an evening drinking schedule broken into checkpoints across iftar, evening, and suhoor. The intake is governed by a strict rule: no more than 0.75 L in any rolling 60 minutes. If the user falls behind schedule, Waha automatically redistributes the remaining volume across subsequent hours ("redistribute, don't fail").
8. **Streak & History Review:** At day's end, achieving ≥90% of that day's own unrounded target increments the consecutive day streak. The user can view their past 7 days on the history strip.

## Screens and Layout
Waha is a focused, responsive, single-page web app structured into three clean surfaces:
1. **Onboarding Modal / First-Use Screen:** Clean card capturing weight, activity, outdoor exposure, and safety acknowledgment. Disappears permanently once completed (stored in `localStorage`).
2. **Main Hydration Screen (Default Day View):**
   - *Header:* Brand mark ("Waha"), current streak badge (with flame/drop icon), settings/profile gear, and Ramadan mode toggle.
   - *Hero Target Area:* Dynamic target in liters (e.g., "3.1 L") rounded to 0.1 L for display, with stacked explanatory tags ("+0.5 L Hot Heat", "+0.25 L Mixed Outdoors").
   - *Interactive Liquid Progress Visual:* Smooth fluid wave graphic depicting current percent of target reached and remaining volume.
   - *Quick Condition Controls:* Pill selector for conditions (Mild / Hot / Extreme) and a workout toggle (+30 min / +60 min).
   - *Hero Logging Action:* Large primary one-tap button (250 ml default) flanked by quick presets (150 / 250 / 500 ml) and undo action.
   - *7-Day History Strip:* Horizontal indicator displaying the last 7 days of completion status (visual history only).
3. **Ramadan Mode View (Active Fasting / Evening):**
   - *Daylight State:* Calming twilight theme, fasting status banner, and live countdown timer to iftar.
   - *Night Drinking Schedule:* Checkpoint cards (Iftar, Post-Meal, Night Sips, Suhoor) with designated target volumes and remaining intake. Editing iftar time immediately forces the night state.
4. **About & Safety Modal:** Accessible from header, displaying safety disclaimers, hydration guidelines, and local reset option.

## Look and Feel
- **Color Palette:**
  - *Day Mode:* Oasis Teal (`#0D9488` / `#14B8A6`), Warm Sand (`#F5EBE1` / `#FAF5EF`), Deep Slate (`#1E293B`).
  - *Ramadan / Evening Mode:* Deep Twilight Navy (`#0F172A` / `#1E1B4B`), Crescent Gold (`#F59E0B`), Luminous Cyan (`#38BDF8`).
- **Typography:** Self-hosted sans-serif font bundled locally (no external CDN dependencies). Large tabular numerals for target volumes and countdown timers so numbers are clear heroes.
- **Motion & Dynamics:** Fluid sinusoidal liquid wave fill inside the progress vessel; smooth counter transitions when conditions change; subtle celebratory particle splash upon reaching 100%. Logging feedback is snappy (<100ms) with zero latency drag.
- **Tone:** Encouraging, thoughtful, and culturally attuned—never clinical, judgmental, or scolding.

## Features and Behavior

### 1. Transparent Target Calculation Engine
Source: `scope.md > The Unique Kernel`, `scope.md > Acceptance Notes & Unit Tests`.
- All calculation rules, multipliers, and bounds reside in a single configuration module.
- Baseline = `weightKg * 0.033 L` (e.g. 70 kg -> 2.31 L, rounded to 2.3 L for Mild display).
- Heat Additions: Mild (+0 L), Hot (+0.5 L), Extreme (+0.8 L).
- Outdoor Time Additions (applied on Hot/Extreme): Indoors (+0 L), Mixed (+0.25 L), Mostly Outdoors (+0.5 L).
- Workout Addition: +0.35 L per 30 minutes.
- Absolute clamps: Minimum 1.5 L, Maximum 4.5 L.
- Target is rounded to 0.1 L for display purposes only. Unrounded target values are retained internally for streak calculations.
- **Acceptance Criteria:**
  - [ ] For 70 kg, mixed outdoors, baseline Mild displays exactly 2.3 L.
  - [ ] Switching to Hot displays exactly 3.1 L with explanatory tag "+0.5 L heat, +0.25 L outdoors".
  - [ ] Switching to Extreme + 30-min workout displays exactly 3.7 L.
  - [ ] All constants are imported from a single centralized configuration file.

### 2. One-Tap Logging & Liquid Progress
Source: `scope.md > The Core Loop`, `scope.md > The POC Boundary`.
- Single tap on hero button logs 250 ml immediately and animates progress.
- Quick preset buttons log 150 ml or 500 ml.
- Undo toast allows immediate rollback of the last logged entry.
- Visual container animates liquid fill to corresponding percentage (logged / target).
- **Acceptance Criteria:**
  - [ ] Tapping 250 ml increments logged volume, updates liquid height, and decreases remaining amount.
  - [ ] Tapping Undo decrements logged volume back to previous state.
  - [ ] Reaching ≥100% triggers a distinct celebratory visual banner and effect.

### 3. Ramadan Evening Scheduler ("Redistribute, Don't Fail")
Source: `scope.md > The Unique Kernel`, `scope.md > Acceptance Notes & Unit Tests`.
- Toggling Ramadan mode switches to twilight theme and calculates an evening drinking schedule between iftar and suhoor.
- Editing the iftar time immediately switches the app to the night state, so demonstrations do not depend on the real system clock.
- Strict Safety Rule: Maximum 0.75 L over any rolling 60 minutes across the entire window.
- Block structure and durations:
  - Iftar block (~1 hour from sunset): ~20% of daily target.
  - Evening / Post-Meal block (~3 to 4 hours): ~40% of daily target.
  - Night Sips block (~2 to 3 hours): ~15% of daily target.
  - Suhoor block (~1.5 hours before dawn): ~25% of daily target.
- Clamping and Redistribution:
  - If the iftar block exceeds 0.75 L, it is clamped to 0.75 L, and the remainder is pushed into the evening block.
  - If the user logs less than expected or falls behind schedule, the scheduler spreads the remaining target evenly across remaining hours without warning banners or failure states.
  - If the user-edited window is too short to safely fit the target (i.e. total window hours * 0.75 L < daily target), Waha safely caps the planned total to `window_hours * 0.75 L` and alerts the user that the shortened window cannot safely accommodate the full target.
- Day Boundary: In Ramadan mode, a hydration day runs from iftar to the next iftar (or rolls over at fajr), so night drinking logs attribute toward the correct streak day.
- **Acceptance Criteria:**
  - [ ] 70 kg Hot profile (3.1 L target) allocates 0.62 L to iftar (20% of 3.1 L).
  - [ ] 70 kg Extreme + 30 min profile (3.7 L target) allocates 0.74 L to iftar (20% of 3.7 L) and does not clamp.
  - [ ] Edge case test (90 kg, Extreme + 30 min workout, ~4.4 L target): uncapped iftar share of 0.87 L is strictly clamped to 0.75 L, with 0.12 L pushed to the evening block.
  - [ ] Over any rolling 60 minutes, the schedule never recommends >0.75 L.
  - [ ] Editing iftar time immediately switches app into night mode.
  - [ ] Falling behind in a block redistributes the remaining volume forward across future blocks.

### 4. Streak & 7-Day History
Source: `scope.md > The Core Loop`, `scope.md > The POC Boundary`.
- A day qualifies as successful toward a streak if total logged volume reaches ≥90% of that specific day's personalized unrounded target.
- Changing conditions mid-day re-evaluates the streak threshold against that day's updated target.
- The 7-day strip displays completion history dots/bars for the past 7 days; it is strictly a visual record and does not alter the streak count.
- **Acceptance Criteria:**
  - [ ] Reaching 90% of today's unrounded target marks today as completed and increments streak.
  - [ ] If today's intake is <90% by the day rollover, streak resets to 0.
  - [ ] The 7-day strip correctly reflects the last 7 recorded daily outcomes.

### 5. Safety Disclaimer
Source: `scope.md > What "Working" Looks Like`, `scope.md > The POC Boundary`.
- Prominently displayed during onboarding and accessible via About modal.
- Explicitly states: Waha provides hydration guidance based on general wellness estimates, not medical diagnosis. Individuals with health conditions, or pregnant individuals, must follow physician advice. Fasting observers who are exempt should follow health guidance.
- **Acceptance Criteria:**
  - [ ] First-run onboarding cannot be completed without viewing/acknowledging the safety notice.
  - [ ] About modal displays complete safety disclaimer at all times.

## States and Boundaries
- **First Use (Uninitialized):** Shows Onboarding Modal. No hydration data logged. Defaults pre-populated with reasonable averages (70 kg, mixed outdoors).
- **Normal Use (Hydration In Progress):** Main screen shows current target, liquid progress (e.g. 35%), remaining ml, and active condition pills.
- **Goal Reached State (≥100%):** Liquid fill shows full; celebration badge and congratulatory message displayed. Logging remains active for additional intake.
- **Fasting Daylight State (Ramadan Mode On, Daytime):** Twilight theme, countdown clock ticking down to iftar, logging button de-emphasized.
- **Fasting Night State (Ramadan Mode On, Post-Iftar):** Twilight theme, interactive checkpoint schedule active, dynamic rolling 60-min redistribution enabled.
- **Persistence:** All profile settings, daily logs, conditions, and streak history persist locally in browser `localStorage`. No server round-trip.
- **Offline Capable:** Works 100% offline without network connectivity.

## Product Decisions
- **Rolling 60-Minute 0.75 L Cap:** The safety cap is strictly enforced over any rolling 60-minute window across iftar, evening, and suhoor blocks.
- **Immediate State Switching on Iftar Edit:** Changing iftar time switches the app to night mode instantly to ensure deterministic, friction-free testing and demo presentation.
- **Display Rounding vs. Math Precision:** Targets are rounded to 0.1 L for clean UI display, while the streak check uses the exact unrounded target.
- **Self-Hosted Typography:** Typography is bundled locally within project assets to prevent external network failures and layout shifts.
- **Redistribution vs. Failure:** Falling behind during fasting hours redistributes water forward rather than reprimanding the user.
- **Decoupled Streak & 7-Day Strip:** Streak is determined strictly by consecutive days at ≥90% of that day's own target. The 7-day strip is visual history only.
- **Single Config for Target Constants:** All math multipliers and caps are centralized in one file for transparency and easy verification.

## What We're Building
- Mobile-first single-page web app with Day/Twilight themes and self-hosted fonts.
- Onboarding flow with local profile creation and safety disclaimer.
- Centralized calculation engine with verified demo test cases (2.3 L, 3.1 L, 3.7 L, and 90 kg 4.4 L edge case).
- Hero liquid progress wave animation and one-tap logging (with presets and undo).
- Heat and workout condition toggles with instant live updates.
- Ramadan fasting mode with iftar countdown, immediate night-state switch on time edit, and rolling 60-minute 0.75 L capped schedule.
- Streak counter (≥90% of unrounded target) and 7-day visual history strip.
- About & Safety modal.

## Deferred From the POC
- **Canvas Share Card (P1):** Deferred to after P0 verification.
- **Serverless URL Friend Challenge (P1):** Deferred to after P0 verification.
- **Browser Push/Audio Reminders (P1):** Deferred to ensure core engine and UI are rock solid first.

## Possible Later Enhancements
- Live UAE weather API integration with automatic temperature-based heat switching.
- City-based prayer time lookup (Abu Dhabi, Dubai, Sharjah, etc.).
- Hydration widgets and smartwatch companion app.

## Non-Goals
- No backend servers, user accounts, or cloud databases.
- No medical claims or diagnosis.
- No native app stores or wrapper dependencies.

## Open Questions
- **Day Boundary in Ramadan Mode:** Confirm the exact rollover moment in the technical spec (e.g. rolling over at fajr when fasting begins vs. next iftar at sunset).
- **Too-Short Window Edge Case:** Confirm the exact UI messaging when an edited fasting window cannot safely fit the target under the 0.75 L/hr cap.
