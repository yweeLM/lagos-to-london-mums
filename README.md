# Lagos to London Mums — Join Page

A gated site: `index.html` (public check-in form) + two Vercel serverless
functions (`api/checkin.js`, `api/community.js`) + `assets/logo.png`, backed by
a Supabase table. No build step, no npm dependencies — the API functions use
only Node's built-in `fetch`/`crypto`.

**Why gated, not static:** the WhatsApp group links used to live in a public
JS array that anyone could read via view-source, whether or not they filled
the form. Now the links only ever get sent to a browser that holds a valid
`llm_access` cookie, issued by `/api/checkin` after a real check-in row is
written to Supabase and verified server-side by `/api/community` on every
request. GitHub Pages can no longer host this (it can't run the API
functions) — it needs Vercel (or an equivalent serverless host).

## Deploy it

1. Push this repo to GitHub, then import it at vercel.com/new (or `vercel`
   CLI from this folder) — Vercel auto-detects the `api/` functions, no build
   command needed.
2. In the Vercel project's Settings → Environment Variables, add:
   - `SUPABASE_URL` — the project's API URL (Supabase dashboard → Project
     Settings → API).
   - `SUPABASE_SERVICE_ROLE_KEY` — the `service_role` secret key from the same
     page. **Never commit this or put it in client-side code** — it's the
     only thing standing between the public and the raw `checkins` table.
3. Redeploy after adding the env vars.

> Keep `assets/logo.png` alongside `index.html` in the same relative path —
> both `index.html` and `api/community.js` reference it as `/assets/logo.png`.

## Already wired up

- **Supabase** (`checkins` table, RLS enabled with zero policies — only the
  service-role key can read/write it) is the source of truth for who's
  checked in and gates access to `/community`.
- **Formspree** (`https://formspree.io/f/mgawpzpb`) still gets a copy of every
  submission for email notifications — best-effort, non-blocking, not used
  for gating.
- **Brand**: logo + UK flag chip in the header, "Created by LagosMums" credit,
  full palette recolored to match the LagosMums logo (steel blue, olive-lime,
  warm gold, brown ink).
- **Instagram**: footer links both @lagosmums and @lagosmumsuk.
- **Resources ("Duty Free") section**: UK Relocation Guide, relocation &
  school-selection coaching booking, Amazon shopping list — all linked, all
  behind the gate.

## What it does

1. `index.html` (public): hero + the check-in pre-screen form. POSTs to
   `/api/checkin`.
2. `api/checkin.js`: validates the submission, inserts it into Supabase,
   relays a copy to Formspree, sets a signed-nowhere-but-DB-backed
   `llm_access` cookie (1 year), and the browser is redirected to
   `/community`.
3. `api/community.js`: checks the `llm_access` cookie against Supabase on
   every request. Valid → renders the guidelines, the full "departures board"
   of every WhatsApp group (main, topic subgroups, area-specific subgroups),
   and the resources section. Invalid/missing → redirects to `/`.

Copy, links, and guideline text live in `index.html` (form) and
`api/community.js` (gated content) — plain HTML/CSS/JS + two small Node
functions, no framework.
