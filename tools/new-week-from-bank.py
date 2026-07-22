#!/usr/bin/env python3
"""
new-week-from-bank.py — start a week's lesson from the mechanics bank.

WHY THIS EXISTS
---------------
The bank (`standard5/science/lessons/_mechanics-lab/index.html`) is a runnable
lesson, which is what makes it trustworthy — but it carries two things a real
lesson must NEVER inherit:

  1. a stubbed `window.vcSaveBeans` that resolves without saving anything, and
  2. a dev toolbar that jumps straight past the calibration.

A lesson shipped with (1) looks perfect and banks nothing. That failure is
silent, and a student would only discover it by noticing beans never arrived.
So the deletion is done by this script, not by hand and not by an LLM reading
comments — every lab region is fenced with LAB-ONLY:BEGIN / LAB-ONLY:END and
this strips them mechanically, then refuses to write the file if any trace
survives.

USAGE
-----
    python3 tools/new-week-from-bank.py 7 SC2.03 "Weather Instruments"

writes  standard5/science/lessons/week07-weather-instruments/index.html
with the lab regions gone and `window.LESSON` set for the week. The DATA
objects are still Week 1's sample content — replacing them is the build job.

    --mechanics detective,myth,data     set LESSON.mechanics (default: all 7)
    --slug some-other-slug              override the folder name
    --force                             overwrite an existing index.html
"""

import argparse
import pathlib
import re
import subprocess
import sys
import tempfile

REPO = pathlib.Path(__file__).resolve().parent.parent
BANK = REPO / "standard5" / "science" / "lessons" / "_mechanics-lab" / "index.html"
LESSONS = REPO / "standard5" / "science" / "lessons"

VALID_MECHANICS = ["sim", "trace", "myth", "streak", "detective", "chain", "data"]

# Anything matching these in the OUTPUT means the strip failed. Checked after
# stripping, before writing — a partial strip must never reach a lesson file.
FORBIDDEN = [
    (r"LAB-ONLY", "a lab fence survived"),
    (r"window\.vcSaveBeans\s*=", "the stubbed bean save survived — the lesson would bank nothing"),
    (r"lab-bar|labJump|data-lab-tier|labTier", "lab toolbar markup or code survived"),
    (r"Mechanics Lab", "lab wording survived in the page text"),
]

# Engine blocks that must exist in the output. Same list the daily task greps —
# duplicated here on purpose so the tool is safe run by hand too.
REQUIRED = [
    (r"var TIERS", "tier config"),
    (r"var MECHANICS\s*=", "mechanics registry"),
    (r"function advance", "step-chain wiring"),
    (r"function nextButton", "next-button injector"),
    (r"function continueBtn", "self-paced feedback"),
    (r"function shuffleItemOnce", "answer-position shuffle"),
    (r"var mythDeck", "myth claim-order shuffle"),
    (r"PROGRESSIVE LESSON UNLOCK", "IDEAS #8 unlock guard"),
    (r"lesson_key:\s*LESSON\.idBase", "bean-cap key"),
    (r"window\.LESSON\s*=", "lesson metadata"),
]


def strip_lab_regions(text: str) -> tuple[str, int]:
    """Remove every LAB-ONLY:BEGIN … LAB-ONLY:END region, in any comment syntax."""
    pattern = re.compile(
        r"[ \t]*(?:<!--|/\*)[^\n]*LAB-ONLY:BEGIN.*?LAB-ONLY:END[^\n]*(?:-->|\*/)[ \t]*\n?",
        re.DOTALL,
    )
    out, n = pattern.subn("", text)
    return out, n


def slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return re.sub(r"-{2,}", "-", s)


def main() -> int:
    p = argparse.ArgumentParser(description="Start a week's lesson from the mechanics bank.")
    p.add_argument("week", type=int, help="week number, 2-30")
    p.add_argument("lo", help="SC outcome code, e.g. SC2.03")
    p.add_argument("name", help="lesson title, e.g. 'Weather Instruments'")
    p.add_argument("--mechanics", default=",".join(VALID_MECHANICS))
    p.add_argument("--slug", default=None)
    p.add_argument("--force", action="store_true")
    a = p.parse_args()

    if not 2 <= a.week <= 30:
        print(f"✗ week must be 2-30 (a new Week 1 is not built this way)", file=sys.stderr)
        return 2
    if not BANK.exists():
        print(f"✗ bank not found: {BANK}", file=sys.stderr)
        return 2

    mechanics = [m.strip() for m in a.mechanics.split(",") if m.strip()]
    unknown = [m for m in mechanics if m not in VALID_MECHANICS]
    if unknown:
        print(f"✗ unknown mechanic(s): {', '.join(unknown)}", file=sys.stderr)
        print(f"  choose from: {', '.join(VALID_MECHANICS)}", file=sys.stderr)
        return 2
    if not 1 <= len(mechanics) <= 7:
        print("✗ pick between 1 and 7 mechanics", file=sys.stderr)
        return 2
    if len(mechanics) > 4:
        print(f"⚠ {len(mechanics)} mechanics — a lesson should use 3-4 "
              f"(LESSON-ENGINE-PLAN §5). Seven is a lab, not a lesson.")

    ww = f"{a.week:02d}"
    slug = a.slug or f"week{ww}-{slugify(a.name)}"
    folder = LESSONS / slug
    target = folder / "index.html"

    # ONE FOLDER PER WEEK — a second slug for the same week silently orphans one.
    existing = [d for d in LESSONS.glob(f"week{ww}-*") if d.is_dir() and d.name != slug]
    if existing:
        print(f"✗ Week {a.week} already has a folder: {existing[0].name}", file=sys.stderr)
        print(f"  rebuild that one in place, or pass --slug {existing[0].name}", file=sys.stderr)
        return 2
    if target.exists() and not a.force:
        print(f"✗ {target.relative_to(REPO)} exists — pass --force to overwrite", file=sys.stderr)
        return 2

    text = BANK.read_text(encoding="utf-8")
    text, removed = strip_lab_regions(text)
    if removed == 0:
        print("✗ no LAB-ONLY regions found — has the bank been edited?", file=sys.stderr)
        return 1
    print(f"  stripped {removed} lab region(s)")

    # window.LESSON — the one line that defines the week.
    mech_js = ",".join(f"'{m}'" for m in mechanics)
    lesson_js = (
        "window.LESSON = {\n"
        f"  week:'Wk{a.week}', lo:'{a.lo}', name:{js_str(a.name)}, idBase:'std5-sci-wk{ww}',\n"
        f"  mechanics:[{mech_js}]\n"
        "};"
    )
    text, n = re.subn(r"window\.LESSON = \{.*?\};", lambda _: lesson_js, text, count=1, flags=re.DOTALL)
    if n != 1:
        print("✗ could not rewrite window.LESSON", file=sys.stderr)
        return 1

    # Page furniture. The DATA blocks stay as Week 1 samples — replacing them is the build job.
    text = re.sub(r"<title>.*?</title>",
                  f"<title>Week {a.week} · {esc(a.name)} — Mr. EdLo's Virtual Classroom</title>",
                  text, count=1, flags=re.DOTALL)
    text = text.replace('<meta name="robots" content="noindex,nofollow">\n', "")
    text = re.sub(r"<h1>.*?</h1>", f"<h1>{esc(a.name)}</h1>", text, count=1, flags=re.DOTALL)
    text = text.replace(
        '<span class="chip">🔬 Mechanics Lab</span>',
        '<span class="chip">Standard 5 · Science</span>')
    text = text.replace(
        '<span class="chip">All 7 mechanics</span>',
        f'<span class="chip">Week {a.week} · {esc(a.lo)}</span>')
    text = re.sub(r'<p class="subtitle">.*?</p>',
                  '<p class="subtitle">Practice time! Cement what Mr. EdLo taught you this week.</p>',
                  text, count=1, flags=re.DOTALL)
    text = re.sub(r'<p class="login-hint" id="loginHint">.*?</p>',
                  '<p class="login-hint" id="loginHint">\n      '
                  '<a href="/login/">Log in</a> to save your beans 🌱 to your account.\n    </p>',
                  text, count=1, flags=re.DOTALL)
    # The bank header block is lab documentation; a lesson does not carry it.
    text = re.sub(r"<!-- ═+\n     🔬 MECHANICS LAB.*?═+ -->\n", "", text, count=1, flags=re.DOTALL)

    # ── refuse to write anything that still smells of the lab ──
    problems = [why for pat, why in FORBIDDEN if re.search(pat, text)]
    missing = [what for pat, what in REQUIRED if not re.search(pat, text)]
    for why in problems:
        print(f"✗ {why}", file=sys.stderr)
    for what in missing:
        print(f"✗ engine block missing: {what}", file=sys.stderr)
    if problems or missing:
        print("✗ nothing written.", file=sys.stderr)
        return 1

    if not check_js(text):
        print("✗ generated file has a JavaScript syntax error — nothing written.", file=sys.stderr)
        return 1

    folder.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding="utf-8")

    print(f"✓ {target.relative_to(REPO)}")
    print(f"  Week {a.week} · {a.lo} · mechanics: {', '.join(mechanics)}")
    print(f"  engine verified · lab regions gone · beans save for real")
    print(f"  NEXT: replace the DATA objects (REVIEW, CALIB, and one per mechanic)")
    print(f"        with this week's content. Schemas: MECHANICS-BANK.md")
    return 0


def js_str(s: str) -> str:
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def check_js(html: str) -> bool:
    """node --check every inline script. Skips silently if node is unavailable."""
    blocks = re.findall(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", html, re.DOTALL)
    for i, b in enumerate(blocks):
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
            f.write(b)
            path = f.name
        try:
            r = subprocess.run(["node", "--check", path], capture_output=True, text=True)
        except FileNotFoundError:
            print("  (node not found — skipping syntax check)")
            return True
        finally:
            pathlib.Path(path).unlink(missing_ok=True)
        if r.returncode != 0:
            print(f"  script block {i}:\n{r.stderr}", file=sys.stderr)
            return False
    print(f"  node --check passed on {len(blocks)} script block(s)")
    return True


if __name__ == "__main__":
    sys.exit(main())
