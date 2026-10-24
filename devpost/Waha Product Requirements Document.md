# Waha: Product Requirements Document

*Working name. "Waha" means oasis in Arabic. Hackathon: Devpost Build With AI: Basics. Deadline: Oct 27, 2026, 1:00 am GMT+4.*

## 1. Overview

**One-liner:** A hydration tracker that sets a personal daily water target from your body, the heat, and your day, and switches into a Ramadan mode that plans your drinking around iftar and suhoor.

**Why it exists:** Generic trackers tell everyone to drink "8 glasses." That number has little evidence behind it, and it fails in the two situations that matter most in the Gulf: extreme heat and fasting. Waha gives each person a target that fits their situation and makes logging a single tap.

## 2. Problem Statement

- People under-drink, mostly because they forget and because the target is vague.
- A fixed target ignores body size, temperature, outdoor time, and exercise.
- During Ramadan, people cannot drink from dawn to sunset, so they have to fit a full day of fluids into a short evening window. Almost no mainstream tracker is built around this.
- Existing apps are cluttered with accounts, ads, and settings, so logging becomes a chore and people stop.

## 3. Target Users

**Persona A: Heat-exposed everyday user.** A student, commuter, or outdoor worker in a hot climate. Wants a target that reflects today's conditions and a fast way to log.

**Persona B: Ramadan observer.** Fasts daily and needs a plan for when and how much to drink between iftar and suhoor without overdrinking in one sitting.

**Primary demo user:** Someone in Abu Dhabi who switches between both situations during the year.

## 4. Goals and Non-Goals

**Goals (for the hackathon)**

1. A working proof of concept that does one thing end to end: personalized target, one-tap logging, progress, streak.
2. A polished, coherent look that scores well on Design.
3. A clear 1-3 minute demo that shows the problem, the personalization, and Ramadan mode.

**Non-goals (explicitly cut)**

- User accounts, login, or a backend database
- Real push notifications (use in-app and browser reminders only if time allows)
- Medical advice, diagnosis, or condition-specific targets
- Native mobile apps

## 5. Features and Priorities

### P0: Must ship

**5.1 Onboarding profile (30 seconds)**

- Inputs: weight (kg), activity level, usual time outdoors (mostly indoors / mixed / mostly outdoors).
- Optional: name or nickname for the share card.
- *Acceptance:* a new user reaches the home screen in under 5 taps; values persist after a page reload.

**5.2 Personalized daily target**

- Calculated from the profile plus today's conditions (see section 6).
- Shows the target in liters and in glasses/cups, with a one-line explanation (for example, "+0.5 L for heat").
- *Acceptance:* changing the heat or exercise input visibly changes the target and the explanation.

**5.3 One-tap logging**

- A large central button logs a default amount (for example, 250 ml). A long press or a small selector offers other sizes (150 / 250 / 500 ml).
- Undo for the last entry.
- *Acceptance:* a log takes one tap, updates progress instantly, and is stored locally.

**5.4 Progress visual**

- An animated fill (a bottle, a glass, or a wave) showing percent of target reached, with the amount remaining.
- *Acceptance:* animation is smooth; the goal-reached state is visibly different and celebratory.

**5.5 Heat mode (today's conditions)**

- A simple selector: Mild / Hot / Extreme, plus a "workout today" toggle with duration.
- *Acceptance:* each choice updates the target using the rules in section 6.

**5.6 Ramadan mode**

- A toggle that switches the day into a fasting-aware plan.
- User sets or confirms fasting times (suhoor end / fajr and iftar / maghrib). Defaults are prefilled and editable; no external data source is required.
- The app shows a drinking schedule inside the allowed window, with checkpoints and amounts (see section 7).
- During fasting hours the home screen shows a calm "fasting" state and a countdown to iftar, and logging is de-emphasized.
- *Acceptance:* the full daily target is distributed across the evening-to-suhoor window, with no single sitting above the per-hour cap.

**5.7 Streaks and history**

- A day counts toward the streak if the user reaches at least 90% of that day's personalized target.
- A 7-day history strip and a current-streak counter.
- *Acceptance:* streak increases the day after a hit, resets after a miss, and uses each day's own target (so a hot-day target change cannot unfairly break it).

### P1: Should ship if P0 is done

**5.8 Share card.** One button generates an image of today's result (target, percent, streak, a short line) for sharing.

**5.9 Friend challenge without a backend.** A "challenge a friend" link that encodes the sender's nickname, streak, and weekly percentage in the URL. A friend who opens it sees a side-by-side comparison with their own local stats. No accounts and no server are needed.

**5.10 Reminders.** Browser notifications (with permission) or in-app prompts, spaced across the waking day, or across the evening window in Ramadan mode.

### P2: Stretch, mention as future work if not built

- Auto-fetch temperature from a free weather API, with the manual selector as the fallback
- Rewards and badges beyond streaks
- Prayer-time lookup by city
- Real leaderboards (needs a backend)
- Installable app (PWA) with offline support

## 6. Target Calculation (Heat-Aware Engine)

These are simple rule-of-thumb estimates, kept in one editable configuration so they are easy to explain and tune.

| Component | Rule |
| --- | --- |
| Base | weight (kg) x 0.033 L |
| Heat | Mild: +0 L. Hot (about 30 to 38 C): +0.5 L. Extreme (above 38 C): +0.8 L |
| Time outdoors | Indoors: +0 L. Mixed: +0.25 L. Mostly outdoors: +0.5 L (applied on Hot and Extreme days) |
| Exercise | +0.35 L per 30 minutes |
| Floor and cap | Minimum 1.5 L, maximum 4.5 L per day |

**Example:** 70 kg, hot day, mixed outdoors, 30-minute workout = 2.31 + 0.5 + 0.25 + 0.35 = about 3.4 L.

The UI always shows *why* the number is what it is. This is the key differentiator against "8 glasses."

## 7. Ramadan Mode Logic

**Window:** drinking is allowed from iftar (maghrib) until suhoor ends (fajr).

**Default distribution of the daily target** (editable constants):

- Iftar (first 30 minutes): 20%
- Evening after the meal, in small steady doses: 40%
- Before sleep: 15%
- Suhoor: 25%

**Rules**

- Sip, do not chug: no more than about 0.75 L in any single hour.
- The schedule renders as checkpoints (for example, "Iftar: 2 glasses", "9:00 pm: 1 glass") that tick off as the user logs.
- If the user falls behind, the remaining target is redistributed across the remaining window instead of shown as a failure.
- Streak logic is unchanged: 90% of the day's target counts.

**Respect:** the app never tells anyone to break a fast. Those who are exempt from fasting can simply leave Ramadan mode off.

## 8. User Flows

1. **First run:** Welcome > profile (weight, activity, outdoor time) > today's conditions > home screen with target and the big log button.
2. **Daily use:** Open > tap to log > watch the fill animation > see the remaining amount > goal reached celebration.
3. **Ramadan:** Toggle Ramadan mode > confirm fasting times > see the countdown and the evening schedule > log at iftar and at each checkpoint.
4. **Share (P1):** Tap share > card is generated > copy link or save image.

## 9. Design Requirements

- **Mood:** calm, warm, and clear. Desert-sand and oasis-teal palette, with a darker evening theme that Ramadan mode switches to.
- **Layout:** mobile-first, one primary action per screen, large tap targets.
- **Motion:** a smooth liquid-fill animation and a small, tasteful goal-reached effect. Motion must not slow logging.
- **Typography:** one clean typeface with a clear hierarchy. Numbers (the target and the remaining amount) are the hero.
- **Accessibility:** readable contrast, labeled buttons, and no meaning carried by color alone.
- **Consistency:** the same components, spacing, and tone in every screen, so the product feels finished rather than assembled.

## 10. Technical Approach

- **Stack:** a static web app (for example, Vite with React or plain HTML/CSS/JS). No backend.
- **Storage:** `localStorage` for the profile, the logs, and the streak. Every read and write is guarded against empty or corrupted data.
- **Logic isolation:** the target engine and the Ramadan scheduler are plain functions with unit tests, so the demo numbers are trustworthy and easy to explain.
- **Hosting:** a public repo plus a deployed static site, if time allows. The demo video is the primary submission artifact, since reviewers will not run the code.
- **Required repo files:** `scope.md`, `prd.md`, and `spec.md` generated by the Devpost Learn Skill Pack, committed to the public repo.

## 11. Data Model

- **Profile:** weightKg, activityLevel, outdoorTime, nickname
- **DayRecord:** date, targetMl, entries\[{time, ml}\], conditions{heat, workoutMin}, ramadanMode, achieved (boolean)
- **Settings:** defaultGlassMl, iftarTime, suhoorEndTime, remindersOn
- **Derived:** current streak, weekly percentage

## 12. Judging Criteria Mapping

| Criterion | How Waha addresses it |
| --- | --- |
| Design | A complete, coherent experience with one clear action, a polished fill animation, and a matching evening theme |
| Innovation/Idea | A personalized, explained target that adapts to heat and fasting, which generic trackers do not do |
| Presentation | A video that opens on the real problem ("8 glasses" does not fit a 42 C day or a fast), shows the target change, shows Ramadan mode end to end, and closes with who it helps |

## 13. Timeline

- **Sat Oct 24:** Install the skill pack, run the interview with this PRD as input, finalize `scope.md`, `prd.md`, and `spec.md`, scaffold the app, and build the target engine.
- **Sun Oct 25:** Build one-tap logging, the progress visual, heat inputs, streaks, and Ramadan mode. Then P1 items (share card, friend link) if on schedule.
- **Mon Oct 26:** Polish, fix bugs, record the demo, write the description, push the public repo, and **submit by the evening** (the deadline is 1:00 am on Oct 27).

## 14. Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Scope creep with two modes plus social | Lock P0 first; P1 only after P0 is demo-ready; P2 goes in "future work" |
| Target formula looks arbitrary | Show the breakdown in the UI and keep the constants in one config |
| Ramadan schedule edge cases (crossing midnight) | Treat the window as iftar to next-day fajr and test with fixed sample times |
| Animation or polish eats the schedule | Timebox visual polish to a fixed block on Oct 26 morning |
| Weak demo video | Script it early, record twice, keep it under 3 minutes |
| Local storage cleared or empty | Defaults and graceful empty states everywhere |

## 15. Safety and Disclaimers

- Targets are general estimates, not medical advice.
- People with kidney, heart, or other medical conditions, and anyone pregnant or on fluid-related medication, should follow their doctor's guidance.
- Overdrinking is also unsafe, so the app caps the daily target and the hourly intake.
- Anyone for whom fasting is not medically safe should not fast; the app only supports observers and never encourages fasting.
- A short disclaimer appears in onboarding and in the About section.

## 16. Demo Video Outline (about 2 minutes)

1. **Hook (10 s):** "Everyone says 8 glasses. But it is 42 C, and some of us are fasting."
2. **Personalization (30 s):** enter a profile, switch Mild to Hot to Extreme, and show the target and its explanation change.
3. **One-tap logging (25 s):** tap, watch the fill, undo, hit the goal.
4. **Ramadan mode (35 s):** toggle on, show the countdown, the evening theme, and the checkpoint schedule, then log at iftar.
5. **Streaks and friend challenge (15 s):** the history strip, then the share card or challenge link.
6. **Close (5 s):** who it is for and what you learned.

## 17. Future Work

Automatic weather and prayer-time lookup, real friend leaderboards with accounts, smart reminders that learn the user's routine, a wearable or health-app sync, and support for other fasting traditions.
