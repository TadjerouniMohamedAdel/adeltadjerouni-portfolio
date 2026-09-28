# Stations — daily goals app (Android) — build spec

Design reference: `design/Main.dc.html` (interactive prototype: all four screens, rules and sample data live in the `<script>` at the bottom). Open the Design canvas link for the visual reference.

## Core rules
- User configures **goals**: `name`, `points`, `nonNegotiable` (bool).
- User configures a **daily minimum score**.
- Each day the user ticks goals done. Day score = sum of points of done goals.
- Closing a day:
  - any non-negotiable missed → **counter resets to 0**
  - else score ≥ minimum → **counter +1**
  - else → **no change**
- **Rewards**: `name`, `daysRequired`. A reward is unlocked when the counter reaches `daysRequired` (in the current run — a reset restarts the route).
- Everything (goals, points, minimum, rewards) is editable at any time. Past days keep a snapshot of the goals as they were that day.

## Data model
```ts
Goal    { id, name, points, nonNegotiable }
Reward  { id, name, daysRequired }
Settings{ minScore }
DayLog  { date: 'YYYY-MM-DD', items: {goalName, points, nonNegotiable, done}[],
          score, minScore, total, result: 'count'|'hold'|'reset', counterAfter }
State   { counter, today: 'YYYY-MM-DD', doneToday: Record<goalId, boolean> }
```
Persist locally (Room / SQLite / AsyncStorage). No backend needed.

## Screens (bottom tab bar: Today · Journey · History · Setup)
1. **Today** — date, big successful-days counter, next reward + days away + progress bar; score ring `score/min` with live status banner (counts / below minimum / non-negotiable open); goal checklist (non-negotiables tagged); "Add goal" button; "Close day" → applies rules, shows result sheet (reward-unlocked variant when a station is reached).
2. **Journey** — vertical route: Start → each reward sorted by days. Reached = filled + unlock date; next = highlighted + days away + earliest date; locked = grey. "You are here" marker on the track segment.
3. **History** — last 30 days as a colour grid (counted / no change / reset) with totals; list of days newest first showing `23/20` + result pill; tap to expand goals done/missed.
4. **Setup** — minimum stepper (max = total points), rules summary, goals list (rename, ±points, non-negotiable switch, delete, Add goal), rewards list (rename, days, delete, Add reward).

## Open questions for implementation
- Auto-close a day at midnight if the user forgets? (prototype: manual "Close day")
- Should previously claimed rewards stay claimed after a reset?
- Allow editing a past day's check-ins?

## Visual tokens
Paper `#F3EFE6` · Card `#FFFDF8` · Ink `#1D211C` · Muted `#5E6259` · Line `#DED8CA`
Success `#1E6A50` (soft `#DDEBE3`) · Reward/next `#B34A12` (soft `#F6E2D3`, bright `#E9884E`)
Fonts: Bricolage Grotesque (display/numbers), Instrument Sans (body). Touch targets ≥ 44px.
