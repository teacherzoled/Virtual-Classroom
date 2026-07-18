# backend/ — local master copies of the off-repo code

These files are **not** run by GitHub Pages. They are the source-of-truth mirrors of code that
actually lives in Cloudflare and Google, kept here so future edits start from a complete file
(and you get a full paste-ready version back instead of snippets to hand-insert).

| File | Mirrors | Where it really runs |
|---|---|---|
| `VC-LMS-Backend.gs` | The **VC-LMS Backend** Apps Script | Google Apps Script, attached to the `VC-LMS` Google Sheet (Extensions → Apps Script) |
| `edlo-lms-worker.js` | The **edlo-lms** Cloudflare Worker | dash.cloudflare.com → Workers → edlo-lms |

**Rule:** whenever the live Apps Script or Worker changes, update the matching file here in the same
session, and note the date at the top. When you next need to touch either one, Claude reads the local
file and returns a complete updated version to paste over the live editor.

> The AI proxy Worker `edlo-gemini` (test grading + OpenAI relay) is a separate Worker and is **not**
> mirrored here yet — add it if you ever want the same workflow for it.
