#!/usr/bin/env python3
"""
powerup-images.py — Power-Up illustration converter
Mr. EdLo's Virtual Classroom

WHY THIS EXISTS (August 7, 2026):
The lesson-icon library converts square, white-background PNGs into
base64-embedded .svg files (see assets/lesson-icons/_source/). Power-Up
illustrations are different animals: wide photoreal SCENES with no white
to strip, five per worksheet. Base64-embedding those would push a single
worksheet past 8 MB — unusable on a shared Chromebook. So Power-Up art
takes the other route: optimised .webp loaded by a plain <img> tag.

═══════════════════════════════════════════════════════════════════════
TWO SAFETY RULES, LEARNED THE HARD WAY (icon library, cycles 2-4)
═══════════════════════════════════════════════════════════════════════
A previous batch script renamed files IN PLACE inside the source folder
using os.replace(), which overwrites on a name collision. Combined with a
re-entrancy bug it destroyed ~44 generated source images that OneDrive
could not recover. So:

  1. THIS SCRIPT NEVER WRITES TO, RENAMES, OR DELETES ANYTHING IN
     _source/. It opens files read-only and writes only to img/.
  2. Batch-generated images arrive named by ORDER (001_, 002_ …), and
     order is the ONLY link back to which prompt made them. So run
     --stage FIRST: it builds a labelled contact sheet showing the name
     each image is about to receive. Confirm that, THEN convert.

═══════════════════════════════════════════════════════════════════════
USAGE
═══════════════════════════════════════════════════════════════════════
  # 1. Check the order mapping before anything is written
  python3 tools/powerup-images.py standard5/science/power-ups/3a --stage

  # 2. Once the contact sheet looks right
  python3 tools/powerup-images.py standard5/science/power-ups/3a

  # options
  --width 1600 --quality 88     tune output
  --map q1,q2,q3,q4,q5          override the position -> name mapping
  --dry-run                     report only, write nothing

NAMING
  Files already named q1.png … q5.png are used as-is.
  Anything else (001_abc.png, image (3).png …) is mapped BY SORTED
  POSITION onto q1 … q5 — which is why --stage exists.

REQUIREMENTS
  Pillow with WebP support.
"""

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, features
except ImportError:
    sys.exit("Pillow is not installed.  pip install Pillow --break-system-packages")

if not features.check("webp"):
    sys.exit("This Pillow build has no WebP support — cannot continue.")

SRC_EXT = {".png", ".jpg", ".jpeg", ".webp"}
# The .illus-col slot is max-width:560px, so 1200 gives a little over 2x
# for high-DPI screens without bloating the file.
DEFAULT_WIDTH = 1200
DEFAULT_QUALITY = 82
DEFAULT_MAP = ["q1", "q2", "q3", "q4", "q5"]


def human(n: int) -> str:
    if n < 0:
        return "—"
    return f"{n/1024:.0f} KB" if n < 1024 * 1024 else f"{n/1024/1024:.2f} MB"


def collect(src_dir: Path, mapping):
    """Pair each source file with the name it will be given.

    Files already called q1..q5 keep their own name. Everything else is
    batch output named by order, so it is assigned by sorted position.
    """
    files = sorted(p for p in src_dir.iterdir() if p.suffix.lower() in SRC_EXT)
    if not files:
        sys.exit(f"No images found in {src_dir}")

    named, positional = [], []
    for f in files:
        (named if f.stem.lower() in mapping else positional).append(f)

    pairs = [(f, f.stem.lower()) for f in named]
    free = [m for m in mapping if m not in {n for _, n in pairs}]
    for i, f in enumerate(positional):
        pairs.append((f, free[i] if i < len(free) else f"extra{i+1}"))

    pairs.sort(key=lambda p: (mapping.index(p[1]) if p[1] in mapping else 99))
    return pairs, bool(positional)


def stage(pairs, base: Path, out_dir: Path):
    """Contact sheet: every image labelled with the name it will receive.

    Written to img/_STAGE-check-order.png so it never touches _source/.
    """
    cols, tw = 2, 520
    thumbs = []
    for src, name in pairs:
        with Image.open(src) as im:
            im = im.convert("RGB")
            im.thumbnail((tw, tw), Image.LANCZOS)
            thumbs.append((im.copy(), name, src.name))

    pad, band = 14, 46
    cw = tw + pad
    ch = max(t[0].height for t in thumbs) + band + pad
    rows = (len(thumbs) + cols - 1) // cols
    sheet = Image.new("RGB", (cw * cols + pad, ch * rows + pad), "#101820")
    d = ImageDraw.Draw(sheet)

    for i, (im, name, orig) in enumerate(thumbs):
        x = pad + (i % cols) * cw
        y = pad + (i // cols) * ch
        sheet.paste(im, (x, y))
        d.rectangle([x, y + im.height, x + tw, y + im.height + band], fill="#20C997")
        d.text((x + 10, y + im.height + 8), f"-> {name}.webp", fill="#0d1f1a")
        d.text((x + 10, y + im.height + 26), f"from {orig}", fill="#0d1f1a")

    out_dir.mkdir(parents=True, exist_ok=True)
    dst = out_dir / "_STAGE-check-order.png"
    sheet.save(dst)
    return dst


def convert(src: Path, name: str, out_dir: Path, width: int, quality: int, dry: bool):
    with Image.open(src) as im:          # read-only; _source is never modified
        im = im.convert("RGB")
        ow, oh = im.size
        if ow > width:
            im = im.resize((width, round(oh * width / ow)), Image.LANCZOS)
        nw, nh = im.size

        dst = out_dir / f"{name}.webp"
        if dry:
            new_bytes = -1
        else:
            out_dir.mkdir(parents=True, exist_ok=True)
            im.save(dst, "WEBP", quality=quality, method=6)
            new_bytes = dst.stat().st_size

    return {"src": src.name, "name": name, "dst": dst, "ow": ow, "oh": oh,
            "nw": nw, "nh": nh, "old": src.stat().st_size, "new": new_bytes}


def main():
    ap = argparse.ArgumentParser(description="Convert Power-Up source art to web-ready WebP.")
    ap.add_argument("folder", help="Worksheet folder, e.g. standard5/science/power-ups/3a")
    ap.add_argument("--source", default="_source")
    ap.add_argument("--out", default="img")
    ap.add_argument("--map", default=",".join(DEFAULT_MAP),
                    help="Position -> name mapping (default q1,q2,q3,q4,q5)")
    ap.add_argument("--width", type=int, default=DEFAULT_WIDTH)
    ap.add_argument("--quality", type=int, default=DEFAULT_QUALITY)
    ap.add_argument("--stage", action="store_true",
                    help="Build the labelled contact sheet and stop. Run this FIRST.")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    base = Path(a.folder).resolve()
    src_dir, out_dir = base / a.source, base / a.out
    mapping = [m.strip().lower() for m in a.map.split(",") if m.strip()]

    if not src_dir.is_dir():
        sys.exit(f"No source folder: {src_dir}\nCreate it and drop the generated images in.")

    pairs, positional = collect(src_dir, mapping)

    if a.stage:
        dst = stage(pairs, base, out_dir)
        print(f"\n  Contact sheet written: {dst}\n")
        for src, name in pairs:
            print(f"    {src.name:<28} ->  {name}.webp")
        print("\n  ⚠  Batch images are matched BY ORDER. Open the contact sheet and check every")
        print("     picture sits against the right question before converting. If the order is")
        print("     wrong, fix it with --map (e.g. --map q3,q1,q2,q5,q4).\n")
        return

    if positional:
        print("\n  ⚠  Some files are not named q1..q5, so they were mapped BY SORTED ORDER.")
        print("     If you have not run --stage yet, do that first.\n")

    print(f"\n  Power-Up image conversion — {base.name}")
    print(f"  {len(pairs)} file(s) · target width {a.width}px · quality {a.quality}"
          + ("  [DRY RUN]" if a.dry_run else "") + "\n")

    rows, total_old, total_new = [], 0, 0
    for src, name in pairs:
        r = convert(src, name, out_dir, a.width, a.quality, a.dry_run)
        rows.append(r)
        total_old += r["old"]
        total_new += max(r["new"], 0)

        shrink = "" if r["new"] < 0 else f"  ({100 - r['new']*100/r['old']:.0f}% smaller)"
        print(f"    {r['src']:<24} -> {r['name']:<5} {r['ow']}x{r['oh']} -> {r['nw']}x{r['nh']}"
              f"   {human(r['old'])} -> {human(r['new'])}{shrink}")

        if r["ow"] / r["oh"] < 1.2:
            print(f"      ⚠  nearly square (ratio {r['ow']/r['oh']:.2f}). Power-Up scenes want "
                  f"landscape — 1536x1024 is the house spec.")

    print(f"\n    TOTAL  {human(total_old)} -> {human(total_new) if not a.dry_run else '—'}")
    if not a.dry_run and total_new > 600 * 1024:
        print("    ⚠  Over 600 KB for one worksheet. Try --quality 75 or --width 1000;\n"
              "       these pages load on a Chromebook shared by seven students.")

    print("\n  ── Paste into the .illus-col of each question ──\n")
    for r in rows:
        print(f'    <img src="img/{r["dst"].name}" width="{r["nw"]}" height="{r["nh"]}"')
        print(f'         loading="lazy" decoding="async"')
        print(f'         alt="DESCRIBE THE PICTURE — the question must still be answerable')
        print(f'              if this image never loads.">\n')

    print("  Source files were opened read-only. Nothing in _source/ was renamed or removed.\n")


if __name__ == "__main__":
    main()
