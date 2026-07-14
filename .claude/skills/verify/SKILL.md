---
name: verify
description: How to launch and drive razlin-portal to verify changes end-to-end in the browser.
---

# Verifying razlin-portal

## Launch
- `npm run dev` — but check first: the user often already has a dev server on port 3000 (`⨯ Another next dev server is already running` in the log means use the existing one; Turbopack HMR picks up your edits).
- Env comes from `.env.local` (already present). `DATABASE_URL` points at the **real Neon database** — only make reversible mutations and restore state when done (assignee/difficulty chips cycle back around; DONE toggles off by clicking the chore title again).

## Auth
- All routes except `/login` require a `passcode` cookie matching `APP_PASSCODE` (see `proxy.ts`), plus a `player_identity` cookie chosen at `/login/player`.
- The Playwright MCP browser profile usually already has both cookies. If not: go to `/login`, submit the passcode from `.env.local`, pick a player.

## Driving /chores
- "What's next" only shows Done/Cancel actions for occurrences due today or overdue. For future days, click the day number in the calendar grid — the day panel below it (OccurrenceChip) supports everything:
  - Click the chore **title** to toggle DONE/PENDING.
  - Click the **assignee chip** to cycle ❤️ (unassigned) → A → M → 🤝 (Both).
- "Manage chores" rows have a difficulty chip that cycles Easy → Medium → Hard.
- Scoreboard recomputes live from DONE occurrences × current chore difficulty (`lib/scores.ts`), so score assertions must account for retroactive rescoring when you change a chore's difficulty.

## Gotchas
- Accessibility-snapshot refs go stale after every server-action revalidate; re-snapshot or use `browser_evaluate` with text-based lookups.
- Waiting on text like "Hard"/"Easy" is ambiguous — those labels also appear in the add-chore form and other rows; scope lookups to the specific row.
