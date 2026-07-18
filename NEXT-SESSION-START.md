# ▶️ Paste this to start the next session

Copy the block below into a new chat (with the `Virtual-Classroom` folder connected — Claude
will also ask for the Std5 assessment project folder: **School stuff → School Matters →
2026 - 2027 (std 5) → Curriculum → Science**).

---

The **secure test gate is BUILT** across all 16 Std5 Science tests/quizzes (July 17, 2026). Read
`PROJECT-DOCS.md` first — the **📌 Standing Rule** and the **▶️ Take-off Point** — for the full
as-built state. Do NOT rebuild it.

## What's already done (do not redo)

- **Worker:** `edlo-gemini` v3 adds `mode:'questions'` (open-check gate; no passkey, no OpenAI key).
  Grading + AI relay unchanged. Deployed.
- **Pages:** all 16 student test/quiz pages are fetch-render shells with `vcRequireLogin()`, the
  closed-gate panel, the account-based retake lock, and `vcSaveProgress()` logging. Re-audited clean.
- **KV values:** new values (with `"open": false` + `questions`) are in
  `…/Science/Assessment/_SECURE_GATE_KV/` — 14 ready to paste, 2 pending paste-out (c1-unit2,
  c1-review). See that folder's `README_DEPLOY.md`.
- **Passkey:** kept (still the OpenAI cost gate); students enter the monthly code at submit as before.

## What's left to finish the gate (the "deploy" — mostly Edwin pasting)

1. Paste the 14 ready KV values into Cloudflare → KV → `EDLO_ANSWER_KEYS` (leave `open:false`).
2. Paste the LIVE value of `sy2627-std5-c1-unit2-science` and `sy2627-std5-c1-science` to Claude →
   Claude merges the questions + `open:false` → paste the finished values back.
3. `git add -A → commit → push` (16 refactored pages).
4. Spot-check 2–3 tests live: closed screen → flip `open:true` → take it → score lands in the Sheet
   → open on a 2nd device → "already completed" lock.
5. Enroll the real class in the VC-LMS Students tab → run `hashPlainPasswords`.

## Then the next build

**🏪 Bean Store** — queued as the session after the gate (design in `IDEAS.md` #6; Edwin brings the
prize list + bean costs).

## Optional later

- Swap the monthly passkey for the login token so students never type a code (drops the passkey
  entirely while keeping the OpenAI cost protection).

When done, update `PROJECT-DOCS.md` (standing rule) and remind Edwin to `git add -A → commit → push`.

---
