# Computer Club test kit

Tests the Computer Club pages **and** backend without touching the live Sheet.

- `gas-mock.js` runs the **real** `backend/Computer-Club-Backend.gs` in Node with a fake Google Sheet
  (SpreadsheetApp, CacheService, LockService, PropertiesService, Utilities are mocked).
- `server.mjs` serves the website on **http://localhost:5500** and the **real** `backend/computer-club-worker.js`
  on **http://localhost:8787**, wired to that fake Sheet. Extra test-only routes: `/__sheet` (dump every tab as JSON)
  and `/__age_close` (pretend the club closed 31 minutes ago, to test the save grace).
- The browser tests (`e2e*.py`, Playwright + Chrome) open the pages and redirect every call to
  `https://computer-club-records.smartstandardsix.workers.dev` to the local Worker.

All keys, PINs, names and club codes here are made up (`k1`, `TEACH42`, `BYTE7`, "Ana R." …). Never put real ones here:
this repo is public.

## Run everything

```bash
pip install playwright        # once (add --break-system-packages on some Linux setups)
tools/computer-club-tests/run-all.sh
```

Chrome is expected at `/usr/bin/google-chrome`; otherwise `CHROME=/path/to/chrome tools/computer-club-tests/run-all.sh`.
Each browser test writes screenshots to `tools/computer-club-tests/shots/` (ignored by git) and a log to `/tmp/cc-<test>.log`.

## What each file checks

| File | Checks |
|---|---|
| `test-gas.js` | Backend only: ping/key, roster, sign-in, PIN lockout, leading-zero PINs, typing saves, teacher data, TypingClub link filtering, Open/Close switches, 30-min save grace |
| `test-xp.js` | Backend only: Club XP parts, daily caps, once-a-day personal best (anti-sandbagging), badges, standings |
| `e2e.py` | Full student + teacher walk-through; no sideways scrolling at 360 px and 1280 px. **Sets club code BYTE7 and opens the club** |
| `e2e2.py` | Offline play → result queued → sent when back online (runs after `e2e.py`) |
| `e2e-xp2.py` | Live leaderboard, projector, hub standings (runs after `e2e.py`) |
| `e2e-week.py` | Week cards lock/unlock as the teacher changes the week; old missions still save (changes the code to WEEK3, so it runs last in the chain) |
| `e2e-stars.py` | Result stars appear in the result row (the duplicate-id bug) |
| `e2e-switch.py` | Teacher Open/Close switches lock and unlock pages; save grace after closing |
| `e2e-box.py` | Gold typing text shows 6 whole lines |
| `e2e-pools.py` | Weekly typing themes and text pools |
| `e2e-xp.py` | Live XP bar and boards |
| `e2e-timer.py` | Routine timers, soft alarm, projector timer |
| `e2e-float.py` | Floating Picture-in-Picture timer |

## When you add a mission

Copy the closest existing test (e.g. `e2e-stars.py` for a scored game), point it at the new mission page, and add it to
`run-all.sh`. Run the whole kit before every pull request.
