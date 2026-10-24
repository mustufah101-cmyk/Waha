---
doc: scope
status: approved
---

# Waha

A personalized, heat-aware hydration tracker tailored to hot climates like Abu Dhabi and observers of Ramadan, providing transparent daily water targets and an intelligent fasting drinking schedule with zero backend friction.

## The Unique Kernel
Generic trackers give everyone the arbitrary "8 glasses" dogma, which fails in extreme 42 °C heat and during fasting. Waha replaces this with a single transparent engine that calculates an explained, stacked target (e.g. "+0.5 L for heat, +0.25 L for time outdoors") and transforms into an evening Ramadan schedule governed by a strict safety rule: no more than 0.75 L in any single hour across the iftar, evening, and suhoor blocks. The scheduler spreads any pushed remainder across the remaining hours, and if the user falls behind, it redistributes instead of showing a failure ("redistribute, don't fail"). One engine, two very different days, always showing its reasoning.

## Who It's For
A commuter, student, or outdoor worker in Abu Dhabi and the UAE. In extreme heat or while fasting during Ramadan, they currently guess their intake, get dehydrated, or attempt to unsafely chug water all at once at suhoor or iftar. Waha gives them their exact number for today and a realistic plan to drink it.

## The Core Loop
The user opens Waha, sees their personalized target with its stacked explanation, and logs intake with a single tap on the hero button (default 250 ml). A smooth liquid animation fills toward the goal. Hitting at least 90% of that day's own personalized target builds a consecutive daily streak. A 7-day strip provides visual history only.

## Inspiration & Identity
- **Visual Palette:** Calm, natural desert-sand and oasis-teal by day, transitioning into a soothing twilight evening palette when Ramadan mode is active.
- **Typography & Motion:** Clean, modern typography where the target and remaining volume are the heroes; fluid liquid-fill animation that feels refreshing and responsive without slowing down logging.
- **Tone:** Encouraging, pragmatic, and culturally attuned—never clinical, never scolding.

## Why This Matters to the Learner
"Many people have water deficiency especially in a place like Abu Dhabi and UAE in general... leads to severe health concerns later across the line. So we try to help people ensure daily water intake based on several factors." The aim is to build a winning, polished prototype for this hackathon that can subsequently be commercialized for the general public.

## What "Working" Looks Like
In the 1–3 minute demo:
1. **Onboarding & Safety Disclaimer:** Enter demo profile (70 kg, mixed outdoors). The baseline target displays 2.3 L (Mild). Prominent safety disclaimer is visible during onboarding and accessible via About.
2. **Dynamic Target Stacking:** Switch to Hot -> target rolls up to 3.1 L with transparent lines: "+0.5 L for heat, +0.25 L for time outdoors." Switch to Extreme and add a 30-minute workout -> target smoothly increments to 3.7 L with stacked reasoning.
3. **One-Tap Logging & Liquid Fill:** Tap the primary log button to log 250 ml; watch the liquid fill animate and the remaining count decrease. Goal reached triggers a celebratory visual.
4. **Ramadan Mode Pivot:** Toggle Ramadan mode -> theme shifts to a twilight evening palette, displays a countdown to iftar, and distributes the target across iftar, evening, and suhoor. Hourly intake across the entire window is capped at 0.75 L/hour. If the user falls behind or an allocation exceeds the cap, water is safely redistributed across remaining hours ("redistribute, don't fail").
5. **Streak & History:** Streak counter tracks consecutive days meeting ≥90% of that day's own target. The 7-day strip provides historical progress review only.

### Acceptance Notes & Unit Tests
1. **Baseline Demo Assertions:** A unit test asserts the exact demo numbers for 70 kg, mixed outdoors:
   - 2.3 L (Mild)
   - 3.1 L (Hot)
   - 3.7 L (Extreme + 30-min workout)
   *(Note: The clamp does not trigger at the 70 kg demo profile where iftar is 0.74 L, so the live demo flow does not rely on it).*
2. **Iftar Clamp Edge-Case Assertion:** A unit test asserts the edge case: 90 kg, Extreme, mixed outdoors, 30-minute workout (~4.4 L target). The uncapped iftar share is 0.87 L, which cleanly clamps to 0.75 L, with the remaining 0.12 L pushed into the evening block.
3. **Window-Wide Hourly Cap:** No single hour across iftar, evening, or suhoor exceeds 0.75 L. If falling behind, intake redistributes forward across remaining hours rather than showing failure.

## The POC Boundary (Now / P0)
- **Centralized Engine Config & Unit Tests:** All target engine constants, multipliers, hourly caps (0.75 L/hr), and baselines reside in one single configuration file; unit tests assert the exact demo targets and edge cases.
- **Rapid Profile Setup:** Weight (kg), activity level, outdoor exposure, and optional nickname stored locally in `localStorage`.
- **Transparent Target Display:** Live target in liters and cups, with stacked explanatory lines detailing heat, outdoor, and exercise adjustments.
- **One-Tap Logging:** Large default log button (250 ml), quick-selector presets (150 / 250 / 500 ml), and an instant undo button.
- **Liquid Progress Visual:** Animated wave/liquid fill reflecting current progress and remaining liters, with a distinct celebration state upon reaching target.
- **Heat & Activity Controls:** Clean selector (Mild / Hot / Extreme) and workout duration toggle.
- **Ramadan Scheduler:** Mode toggle, customizable iftar/suhoor times, countdown to iftar, window-wide 0.75 L/hr cap, and redistribution logic across remaining hours.
- **Streak Logic & 7-Day History:** Streak counts consecutive days achieving ≥90% of that day's own target; the 7-day strip is visual history only.
- **Safety Disclaimer:** Explicit hydration and safety disclaimer placed prominently in onboarding and within the About modal.

## Later (P1)
- **Share Card Generator:** Client-side canvas/card export generating a shareable image of today's achievement and streak.
- **Serverless Friend Challenge:** URL-encoded link carrying nickname, streak, and percentage for side-by-side local comparison without an account or backend.
- **Reminders:** In-app prompts or optional browser notifications spaced across waking hours or the evening fasting window.

## Explicitly Cut (P2 / Non-Goals)
- **User Accounts & Backend Database:** Cut to keep the app friction-free, instantly demoable, and completely private using `localStorage`.
- **Native Mobile Apps:** Cut in favor of a responsive, mobile-first web app that runs universally on any device.
- **Third-Party Weather / Prayer APIs:** Cut to eliminate external network dependencies and latency risks during live judging; manual presets provide deterministic, guaranteed demo results.
- **Medical Diagnosis / Prescriptive Advice:** Cut for safety and liability; Waha provides hydration guidance and caps, with explicit disclaimers directing individuals with medical conditions to their doctors.
