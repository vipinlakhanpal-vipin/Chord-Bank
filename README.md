# Chord Bank — Bollywood Chords for the 6 Chords You Know

**Current version: v1.28** (see [Versioning](#versioning) below for how this number moves)

A practice app for Hindi/Bollywood songs (1970 onward), built entirely around six chords: **A, E, Em, G, C, D**.
Every song is checked against that set; if it doesn't fit as-is, the app finds a capo/key-shift that makes it fit,
and only shows you shifts that stay inside your six chords.

## What's actually in this scaffold

- **Song library** grouped by singer, searchable, tagged "playable as-is" / "playable with a shift" / "needs other chords."
  Stored in Supabase, not in this codebase — see "Where your songs live" below.
- **Add / Edit / Delete Song** (`app/songs/new`, `app/songs/[id]/edit`) — paste in a chart (title, singers, year,
  genres, a YouTube link, and the `[Chord]lyric` text) and it's saved straight to your `songs` table. Requires being
  logged in; anyone with the link can still browse and play what's there. Paste straight from Ultimate Guitar or a
  similar site (chords on their own line above the lyrics) and it's auto-converted to inline `[Chord]lyric` format
  on paste (`lib/chartImport.ts`) — already-inline text pastes through unchanged either way. You can always hand-move
  a `[Chord]` tag afterward if the auto-placement lands on the wrong word.
- **Chord + transpose engine** (`lib/chords.ts`) — pure logic, no dependencies, fully testable. This is the heart of
  the app: it does *not* offer generic transposition, only the shifts that land every chord in the song back onto
  A/E/Em/G/C/D.
- **Chord charts as chords-over-lyrics text** (like Ultimate Guitar) — no song audio is stored or downloaded anywhere.
  Unlike Ultimate Guitar, this app has no publisher licensing deal for lyric content, so it doesn't generate, source,
  or ship any lyrics itself — every chart comes from you pasting in text you already have.
- **In-app YouTube embed** per song, so you can hear the original while practicing — this uses YouTube's own official
  embed player (a linked iframe), not a downloaded copy.
- **Recording studio** (`app/record`) — real `getUserMedia` + `MediaRecorder` implementation. Detects any mic
  (built-in or external/USB, on Mac or phone), lets you toggle echo cancellation / noise suppression / auto-gain
  (these run through the OS/browser audio stack, which is the realistic ceiling for in-browser "noise cancellation" —
  see note below), shows a live level meter, and lets you play back and download recordings.
- **Repositories** (`app/repositories`) — organizational tags for grouping songs by language/year range. Purely a
  label; the actual songs still go in one at a time through Add Song.
- **Settings** — light/dark theme (persisted), profile display name, sign out.
- **Auth** — Supabase email/password (`app/login`, `app/signup`). No social login, no magic links, kept simple as requested.
- **Supabase schema** (`supabase/schema.sql`) — songs, repositories, recordings, profiles, with row-level security.

## Where your songs live

The library used to be 35 hardcoded demo songs shipped in this repo's source. Those are gone — full commercial song
lyrics aren't something this app (or any AI-assisted tool without a publisher licensing deal) can generate, source,
or ship on your behalf, regardless of how the request is framed. What's left is genuinely yours to fill in: log in,
hit **+ Add Song**, and paste in the chart text you've sourced yourself. It's saved to your own Supabase `songs`
table and runs through the same transpose engine either way. If you're setting this up on a project that already
ran the old schema, run the one-line migration comment at the top of `supabase/schema.sql` to add the new `genres`
column, plus the new insert/update/delete policies further down the same file.

## Why this stack (Next.js + Vercel + Supabase + GitHub)

- **Next.js on Vercel**: one codebase serves your Mac browser and your phone browser (installable as a PWA later
  with zero extra infra), free tier is enough for personal use, and deploys straight from GitHub on every push.
- **Supabase**: Postgres + Auth + Storage in one place. Auth gives you real email/password accounts without you
  managing password hashing yourself. Storage holds your recorded audio files privately (RLS scoped to `auth.uid()`).
- **GitHub**: version history and the trigger for Vercel's auto-deploys.

This is the standard "solo builder" stack for exactly this kind of app — you get a real product without paying for
infrastructure you don't need yet.

## Recording quality — what to expect

True studio-grade noise cancellation (spectral noise-print removal, adaptive suppression tuned to your room) needs
either a native app with DSP libraries (e.g. RNNoise, Krisp SDK) or server-side post-processing. The browser's
built-in `noiseSuppression`/`echoCancellation`/`autoGainControl` constraints (already wired up in `app/record`) are
genuinely good — they're the same APIs Zoom/Meet rely on — but if you want a noticeably cleaner "podcast mic" result,
the next step (Phase 2 below) is running recordings through an RNNoise-based cleanup pass after capture, either in
a Web Worker (client-side, private) or a small serverless function.

## Phased plan

**Phase 1 (this scaffold, web-first)**: everything above, deployed as a Next.js web app on Vercel — works in Mac
Chrome/Safari and in mobile Safari/Chrome on your phone. This is the fastest path to something you can actually use
this week.

**Phase 2 (recording polish)**: add an RNNoise/WASM cleanup pass on captured audio; add multi-track (guitar DI +
vocal mic, if you use an interface); waveform trim/edit before saving.

**Phase 3 (native mobile)**: wrap the core in an Expo/React Native app for a true iOS/Android app — better background
recording, lock-screen controls, and tighter mic control than a mobile browser allows. Most of `lib/chords.ts` and
the Supabase schema carry over unchanged.

**Phase 4 (dropped)**: earlier drafts of this README described an AI ingestion workflow that would automatically
find songs and generate their chord-over-lyrics charts. That's not something this app does — it would mean an AI
reproducing full copyrighted song lyrics at scale, which isn't possible to do responsibly regardless of sourcing or
review steps. Add Song (above) is the real, permanent way songs get into your library: you paste in what you've
sourced, the app never authors lyric content on its own.

## Other feature ideas worth adding later

- **Capo suggestion, not just chord-shift**: show "capo on fret 2, play as if in G" style hints alongside the raw shift.
- **Setlist builder**: pick songs for an evening, auto-order by key so you're not retuning/repositioning constantly.
- **Practice mode**: auto-scroll the chord chart at a tempo you set, hands-free.
- **Chord diagrams**: small fingering diagrams for A/E/Em/G/C/D next to the chart for absolute beginners you might teach.
- **Tag-based playlists**: "wedding set," "60s-70s classics," "monsoon songs," etc. (tags are already in the data model).
- **Offline mode**: cache charts for songs you've starred, so you're not dependent on a connection at a gig.
- **Multi-instrument-friendly transpose**: same engine, different target chord sets, if you ever pick up ukulele etc.

## Getting this running

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase project URL + anon key
npm run dev
```

## Deploying with your own accounts

1. **GitHub**: create a new repo, push this folder to it.
   ```bash
   git init
   git add .
   git commit -m "Initial commit — Chord Bank v1.0"
   git branch -M main
   git remote add origin https://github.com/<you>/chord-bank.git
   git push -u origin main
   ```
2. **Supabase**: create a project at supabase.com → SQL Editor → paste and run `supabase/schema.sql` → Storage →
   create a `recordings` bucket (private) → Project Settings → API → copy the URL and anon key.
3. **Vercel**: import the GitHub repo at vercel.com/new → add the two env vars from step 2 (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) → Deploy. Every push to `main` redeploys automatically.
4. On your phone, open the Vercel URL in the browser and "Add to Home Screen" for an app-like icon while Phase 3 is pending.

## Versioning

The app displays its version next to the logo in the navbar (e.g. `v1.26`), read from `lib/version.ts`. This is a
`major.minor.patch` string; the navbar shows it as `vMAJOR.MINOR` with minor zero-padded to two digits, plus the
patch digit appended only when it's non-zero (e.g. `v1.26.1`).

- Bump **minor** by 1 (1.26.0 → 1.27.0, shown as `v1.26` → `v1.27`) for a normal shipped change — new feature, fix,
  content batch, whatever. This is the normal case.
- When minor rolls past 99, bump **major** and reset minor to 0 (1.99.0 → 2.0.0, shown as `v1.99` → `v2.0`).
- Bump **patch** only for a fix too small to deserve its own minor step (e.g. `v1.26` → `v1.26.1`); it resets to 0
  at the next minor bump.

(Versions before this scheme — v1.0 through v2.3 — used an earlier whole-number-per-change convention, and v2.04
through v2.06 briefly used 2-digit-padded minors under major 2, all keeping their old labels. The number was then
deliberately restarted at v1.26 per request — nothing about those releases was undone, only the label going
forward. Only entries from v1.26 onward follow the rule above.)

Tell me what changed and I'll update `APP_VERSION` in `lib/version.ts`, add a line to the History comment above it,
and hand you the new build — you don't need to touch this yourself unless you want to.

## Project structure

```
app/                Next.js App Router pages (songs, record, repositories, settings, login/signup)
components/         UI building blocks (ChordLine, YouTubeEmbed, Navbar, ThemeProvider, SongCard)
lib/chords.ts        The transpose/chord-matching engine — read this first
lib/chartImport.ts   Converts a pasted Ultimate-Guitar-style chart (chords above lyrics) to inline format
lib/types.ts         Song / Repository types
lib/supabaseClient.ts Supabase client init
lib/useSongs.ts      Supabase-backed hooks the pages read your library through
data/songs.ts        Empty — your songs live in Supabase, added via Add Song
supabase/schema.sql   Full DB schema + RLS policies
```
