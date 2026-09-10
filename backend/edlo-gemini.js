/* ============================================================
   EdLo Virtual Classroom — Worker  ·  v3 (adds mode:"questions")
   ------------------------------------------------------------
   ⚠️ LOCAL MASTER COPY — mirrors the code deployed in the
   "edlo-gemini" Cloudflare Worker (dash.cloudflare.com → Workers →
   edlo-gemini). It is NOT run by GitHub Pages; it is the source of
   truth so future edits start from here and produce a complete file
   to paste back. When you change the live Worker, update this file
   too (and vice versa).
   Last synced: September 10, 2026 (first mirror, plus two fixes:
     • match/label items worth 1 mark are now all-or-nothing — Math.round
       was awarding the full mark for a half-right answer. Items worth 2+
       marks are bit-identical to before; only the Std 5 diagnostic uses
       1-mark items, so no live test changes.
     • max_completion_tokens 2000 -> 4000, so a 6-written-item paper cannot
       truncate its reply and send every written item to pending.)

   ⚠️ SHARED WORKER: every test and quiz on the site grades through
   this one file. Any change here hits ALL live assessments — test
   against one testId before deploying.
   ------------------------------------------------------------
   THREE MODES, one Worker, all subjects:

   1) AI RELAY (unchanged behaviour)
      Body has `messages` → checks passkey, forwards to OpenAI,
      returns the model response. OpenAI key read from env.OPENAI_KEY.

   2) GRADING (grades the WHOLE test)
      Body has `mode:"grade"` → checks passkey, reads the test's
      answer key from KV (env.ANSWER_KEYS), scores fixed items
      server-side and AI-grades written items against KV rubrics.
      Correct answers + rubrics NEVER reach the browser.

   3) QUESTIONS — SECURE TEST GATE  (July 2026)
      Body has `mode:"questions"` → reads the test's KV entry and,
      ONLY IF that entry has `"open": true`, returns the display
      questions (stems/options/figures — NO answers, which live in
      the same entry but are never sent). If `open` is false/absent,
      returns `{ok:true, open:false, ...}` and NOTHING else — so a
      closed test shows nothing on screen or in view-source.
      This mode needs NO passkey (it runs on page load, before the
      student has entered any code) and NEVER touches the OpenAI key.
      The `open` flag is flipped by Mr. EdLo in the Cloudflare KV
      dashboard on test morning; the server clock, not the device,
      decides — so device-clock cheating is impossible.

   Answer keys live in KV namespace EDLO_ANSWER_KEYS (binding ANSWER_KEYS),
   one entry per test, keyed by testId (e.g. "sy2627-std5-c1-science").
   Adding a new test = adding a new KV entry. No code change needed.

   KV entry shape:
     open      → boolean (test gate; absent = closed)
     title     → string (optional; shown while loading)
     questions → { items:[ display objects, NO answers ], sections:{...}, figs:{...} }
     items     → per-item answer key (unchanged):
       fixed  → { type:"mc|tf|fib|match|label", points, answer, accept?, answerText?, explain? }
       written→ { type:"sa|open", points, rubric }      ← rubric graded by AI
   ============================================================ */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

// Monthly-rotating class passkey (unchanged from your original).
function getCurrentValidKey() {
  const now = new Date();
  const schedule = {
    "2026-05": "JAGUAR-77",
    "2026-06": "REEF-STAR4",
    "2026-07": "TAPIR-X9",
    "2026-08": "COPAL-33",
    "2026-09": "HOWLER-51",
    "2026-10": "CEIBA-28",
    "2026-11": "TOUCAN-6K",
    "2026-12": "XMAS-EDLO",
  };
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return schedule[key] || "EDLO-STD6";
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const VALID_KEY = getCurrentValidKey();

    try {
      const body = await request.json();

      // ════════════════════════════════════════════════
      //  MODE 3 — QUESTIONS (SECURE TEST GATE)
      //  Runs BEFORE the passkey gate: no passkey needed to
      //  ask "is this test open?", and a closed test reveals
      //  nothing. No OpenAI key is ever touched here.
      // ════════════════════════════════════════════════
      if (body.mode === 'questions') {
        const testId = body.testId;
        if (!testId) return json({ error: 'NO_TEST_ID' }, 400);

        const raw = await env.ANSWER_KEYS.get(testId);
        if (!raw) return json({ error: 'NO_KEY_FOR_TEST', testId }, 404);

        let key;
        try { key = JSON.parse(raw); }
        catch (e) { return json({ error: 'BAD_KEY_JSON', testId }, 500); }

        // The gate. Absent/false → closed → return nothing but the flag.
        if (key.open !== true) {
          return json({ ok: true, open: false, testId });
        }

        // Open → return display questions only. Never include the
        // `items` answer key, even though it sits in the same entry.
        return json({
          ok: true,
          open: true,
          testId,
          title: key.title || '',
          questions: key.questions || null,
        });
      }

      // ── Passkey gate (applies to GRADE + AI RELAY modes) ──
      const passkey = body.passkey || '';
      if (passkey !== VALID_KEY) {
        return json({
          error: 'INVALID_KEY',
          message: 'Incorrect class code. Please ask Mr. EdLo for the correct code.',
        }, 403);
      }

      // ════════════════════════════════════════════════
      //  MODE 2 — SERVER-SIDE GRADING (whole test)
      // ════════════════════════════════════════════════
      if (body.mode === 'grade') {
        const testId = body.testId;
        if (!testId) return json({ error: 'NO_TEST_ID' }, 400);

        // read this test's answer key from KV
        const raw = await env.ANSWER_KEYS.get(testId);
        if (!raw) return json({ error: 'NO_KEY_FOR_TEST', testId }, 404);

        let key;
        try { key = JSON.parse(raw); }
        catch (e) { return json({ error: 'BAD_KEY_JSON', testId }, 500); }

        const studentAnswers = body.answers || {};
        const items = key.items || {};
        const results = {};
        let autoTotal = 0;       // total available FIXED-item marks
        let autoEarned = 0;      // fixed-item marks earned
        let writtenTotal = 0;    // total available WRITTEN-item marks
        let writtenEarned = 0;   // written-item marks earned
        let anyPending = false;  // true if any written item could not be AI-graded

        // collect written items to grade in ONE AI call after the fixed loop
        const writtenQueue = [];

        for (const qid of Object.keys(items)) {
          const it = items[qid];
          const pts = it.points || 0;
          const given = studentAnswers[qid];

          // ---------- FIXED ITEMS ----------
          if (it.type === 'mc' || it.type === 'tf') {
            const correct = mcMatches(given, it);
            const earned = correct ? pts : 0;
            autoTotal += pts; autoEarned += earned;
            results[qid] = { kind:'auto', correct, earned, points: pts,
              correctAnswer: displayAnswer(it), explain: it.explain || '' };
          }
          else if (it.type === 'fib') {
            const accept = (it.accept || [it.answer]).map(normalize);
            const g = normalize(given);
            const correct = accept.some(a => g === a || (a.length > 2 && g.includes(a)));
            const earned = correct ? pts : 0;
            autoTotal += pts; autoEarned += earned;
            results[qid] = { kind:'auto', correct, earned, points: pts,
              correctAnswer: displayAnswer(it), explain: it.explain || '' };
          }
          else if (it.type === 'match' || it.type === 'label') {
            const ans = it.answer || [];
            const gv = Array.isArray(given) ? given : [];
            const per = ans.length ? pts / ans.length : 0;
            let hits = 0;
            for (let i = 0; i < ans.length; i++) {
              if (normalize(gv[i]) === normalize(ans[i])) hits++;
            }
            /* A 1-mark item cannot express partial credit in whole marks, so it is
               all-or-nothing. Math.round() would otherwise award the full mark for a
               half-right answer (2 of 4 positions -> round(0.5) -> 1). Items worth 2+
               marks are unaffected: this branch cannot fire for them. */
            const earned = (pts <= 1)
              ? (hits === ans.length ? pts : 0)
              : Math.round(per * hits);
            const correct = hits === ans.length;
            autoTotal += pts; autoEarned += earned;
            results[qid] = { kind:'auto', correct, earned, points: pts,
              correctAnswer: displayAnswer(it), explain: it.explain || '' };
          }
          // ---------- WRITTEN ITEMS (queue for AI) ----------
          else if (it.type === 'sa' || it.type === 'open') {
            writtenTotal += pts;
            writtenQueue.push({
              qid,
              points: pts,
              rubric: it.rubric || it.explain || '',   // rubric lives in KV
              question: it.question || it.prompt || '', // optional; helps the AI
              answer: String(given == null ? '' : given).trim(),
            });
          }
          // ---------- UNKNOWN TYPE ----------
          else {
            autoTotal += pts;
            results[qid] = { kind:'auto', correct:false, earned:0, points: pts,
              correctAnswer:'', explain:'' };
          }
        }

        // ---------- AI-GRADE the written items against KV rubrics ----------
        if (writtenQueue.length) {
          let aiScores = null;
          try {
            aiScores = await gradeWritten(writtenQueue, env.OPENAI_KEY);
          } catch (e) {
            aiScores = null;   // fall through to pending below
          }

          for (const w of writtenQueue) {
            const r = aiScores && aiScores[w.qid];
            if (r && typeof r.score !== 'undefined') {
              const earned = Math.max(0, Math.min(w.points, Math.round(Number(r.score) || 0)));
              writtenEarned += earned;
              results[w.qid] = {
                kind: 'ai',
                correct: earned === w.points,
                earned,
                points: w.points,
                correctAnswer: '',
                explain: r.feedback || '',
                pending: false,
              };
            } else {
              anyPending = true;
              results[w.qid] = {
                kind: 'ai',
                correct: false,
                earned: 0,
                points: w.points,
                correctAnswer: '',
                explain: 'Mr. EdLo will review this written answer.',
                pending: true,
              };
            }
          }
        }

        return json({
          ok: true,
          testId,
          autoEarned,
          autoTotal,
          writtenEarned,
          writtenTotal,
          anyPending,
          // grand totals for convenience (page can also compute these)
          totalEarned: autoEarned + writtenEarned,
          totalPoints: autoTotal + writtenTotal,
          results,
        });
      }

      // ════════════════════════════════════════════════
      //  MODE 1 — AI RELAY (unchanged passthrough)
      // ════════════════════════════════════════════════
      delete body.passkey;        // never forward the passkey to OpenAI
      delete body.mode;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_KEY}`,   // ← from encrypted secret
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      return json(data, 200);

    } catch (e) {
      return json({ error: e.message }, 500);
    }
  },
};

/* ============================================================
   gradeWritten() — one OpenAI call scores all written items
   against the rubrics passed in (which came from KV). Returns
   { qid: {score, feedback}, ... }. Throws on network/parse error
   so the caller can mark those items pending.
   ============================================================ */
async function gradeWritten(queue, apiKey) {
  const sys =
    'You are a warm, encouraging Standard 5 (age ~10-11) Science teacher in Belize ' +
    'grading written answers at Howard Smith Nazarene School. Grade each answer ONLY ' +
    'against the rubric given for that question. Reward clear cause-and-effect reasoning ' +
    'over vocabulary, and accept simple, correct Belizean examples. Give 2-4 sentences of ' +
    'specific, kind feedback per answer, addressed to the student. Never mention AI, rubrics, ' +
    'or grading systems. Award a whole number of marks from 0 up to that item\'s maximum. ' +
    'Reply with STRICT JSON only (no markdown, no commentary): an object keyed by question id, ' +
    'each value {"score": <integer>, "feedback": "<text>"}.';

  let usr = 'Grade these answers. For each, the maximum marks and the rubric are given.\n\n';
  for (const w of queue) {
    usr += `QUESTION ID: ${w.qid}  (max ${w.points} marks)\n`;
    if (w.question) usr += `Question: ${w.question}\n`;
    usr += `Rubric: ${w.rubric || '(no rubric supplied — grade for a correct, on-topic Standard 5 answer)'}\n`;
    usr += `Student answer: "${w.answer || '(blank)'}"\n\n`;
  }
  usr += 'Return ONLY the JSON object, e.g. {"' + queue[0].qid + '":{"score":0,"feedback":"..."}}';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-5.4-mini',          // upgraded from gpt-4o-mini (July 2026)
      reasoning_effort: 'low',        // keeps grading fast; deep reasoning not needed for 2-5 mark rubrics
      max_completion_tokens: 4000,    // GPT-5 family: replaces max_tokens; reasoning tokens count against this budget.
                                      // Raised from 2000 (Sep 2026): the diagnostic sends 6 written items in ONE call and
                                      // a truncated reply fails JSON.parse, which sends EVERY written item to pending.
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: usr },
      ],
    }),
  });

  if (!res.ok) throw new Error('OPENAI_HTTP_' + res.status);
  const data = await res.json();
  const text = data && data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content : '';
  if (!text) throw new Error('OPENAI_EMPTY');

  // parse — response_format should give clean JSON, but stay defensive
  let parsed;
  try { parsed = JSON.parse(text); }
  catch (e) {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('OPENAI_BAD_JSON');
    parsed = JSON.parse(m[0]);
  }
  return parsed;
}

// case/space-insensitive compare helper
function normalize(v) {
  return String(v == null ? '' : v).trim().toLowerCase();
}

/* Flexible MC/TF match: the student's answer may arrive as an INDEX ("1"),
   a LETTER ("b"), or the OPTION TEXT ("a solar panel"). The KV `answer`
   may itself be stored as a letter, an index, or (for T/F) "true"/"false".
   This builds the set of acceptable forms for the correct option and checks
   the student's answer against all of them. One Worker, any page convention. */
function mcMatches(given, it) {
  const g = normalize(given);
  if (g === '') return false;

  // T/F: accept true/false, t/f, and 0/1 either way
  if (it.type === 'tf') {
    const truthy = new Set(['true', 't', '1', 'yes']);
    const falsy  = new Set(['false', 'f', '0', 'no']);
    const ansTrue = truthy.has(normalize(it.answer));
    const gTrue = truthy.has(g), gFalse = falsy.has(g);
    if (!gTrue && !gFalse) return false;
    return ansTrue ? gTrue : gFalse;
  }

  // MC: figure out the correct index from KV `answer`
  const letters = ['a','b','c','d','e','f'];
  const opts = Array.isArray(it.options) ? it.options.map(normalize) : [];
  const ans = normalize(it.answer);
  let correctIdx = -1;
  if (/^\d+$/.test(ans)) correctIdx = parseInt(ans, 10);          // answer stored as index
  else if (letters.includes(ans)) correctIdx = letters.indexOf(ans); // as letter
  else if (opts.length) correctIdx = opts.indexOf(ans);           // as text

  // Build every acceptable form of the correct answer
  const accept = new Set();
  if (correctIdx >= 0) {
    accept.add(String(correctIdx));           // index
    if (letters[correctIdx]) accept.add(letters[correctIdx]); // letter
    if (opts[correctIdx]) accept.add(opts[correctIdx]);       // text
  }
  accept.add(ans);                            // whatever KV literally stored
  // Also accept the answerText override if present
  if (it.answerText) accept.add(normalize(it.answerText));

  return accept.has(g);
}

// what to show the student as "the correct answer" in feedback
function displayAnswer(it) {
  if (it.type === 'match' || it.type === 'label') {
    return Array.isArray(it.answerText) ? it.answerText.join(', ')
         : (Array.isArray(it.answer) ? it.answer.join(', ') : '');
  }
  if (it.answerText) return it.answerText;      // human-readable override
  if (it.type === 'fib') return (it.accept && it.accept[0]) || it.answer || '';
  return it.answer || '';
}
