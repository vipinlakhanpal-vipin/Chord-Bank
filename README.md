# Chord Bank — Bollywood Chords for the 6 Chords You Know

**Current version: v1.0** (see [Versioning](#versioning) below for how this number moves)

A practice app for Hindi/Bollywood songs (1970 onward), built entirely around six chords: **A, E, Em, G, C, D**.
Every song is checked against that set; if it doesn't fit as-is, the app finds a capo/key-shift that makes it fit,
and only shows you shifts that stay inside your six chords.

## What's actually in this scaffold

- **Song library** grouped by singer, searchable, tagged "playable as-is" / "playable with a shift" / "needs other chords."
- **Chord + transpose engine** (`lib/chords.ts`) — pure logic, no dependencies, fully testable. This is the heart of
  the app: it does *not* offer generic transposition, only the shifts that land every chord in the song back onto
  A/E/Em/G/C/D.
- **Chord charts as chords-over-lyrics text** (like Ultimate Guitar) — no song audio is stored or downloaded anywhere.
  That's a deliberate legal boundary: distributing copyrighted Bollywood recordings isn't something this app does,
  under any workflow. Chord/lyric annotation for personal practice is the standard, broadly-accepted format chord
  sites have used for decades.
- **In-app YouTube embed** per song, so you can hear the original while practicing — this uses YouTube's own official
  embed player (a linked iframe), not a downloaded copy.
- **Recording studio** (`app/record`) — real `getUserMedia` + `MediaRecorder` implementation. Detects any mic
  (built-in or external/USB, on Mac or phone), lets you toggle echo cancellation / noise suppression / auto-gain
  (these run through the OS/browser audio stack, which is the realistic ceiling for in-browser "noise cancellation" —
  see note below), shows a live level meter, and lets you play back and download recordings.
- **Repositories** (`app/repositories`) — the UI for "give me a language + year range and build a chord repo for it."
  Right now it queues a job; wiring it to a real ingestion pipeline is the AI workflow section below.
- **Settings** — light/dark theme (persisted), profile display name, sign out.
- **Auth** — Supabase email/password (`app/login`, `app/signup`). No social login, no magic links, kept simple as requested.
- **Supabase schema** (`supabase/schema.sql`) — songs, repositories, recordings, profiles, with row-level security.

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

**Phase 4 (AI ingestion workflow for repositories)**: a scheduled job (Supabase Edge Function or a small script) that,
for a queued repository (language + year range):
1. Searches for candidate song titles/singers in that range (metadata only — title, artist, year, movie).
2. Looks up or generates a chord-over-lyrics chart for each (community chord databases, or careful AI-assisted
   transcription from listening — chords only, never lyrics-at-scale reproduction of copyrighted lyric sheets in bulk,
   and always human-reviewed before publishing).
3. Runs each chart through `findPlayableTranspositions` — keeps it if a valid shift exists, flags it otherwise.
4. Inserts into `songs` via a service-role key (never exposed to the browser), sets `added_via = 'ai-workflow'`.
5. Marks the repository `complete` once the batch is done.
This is the part that should NOT run with your public anon key — it needs a server-side secret and ideally a human
approval step before charts go live, since a wrong chord is worse than no chord when you're relying on it mid-song.

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

The app displays its version next to the logo in the navbar (e.g. `v1.0`), read from `lib/version.ts`. This is a
simple `major.minor.patch` string; the navbar shows it as `vMAJOR.MINOR` and rounds down to just those two numbers
when patch is `0`.

- Bump **patch** (1.0.0 → 1.0.1) for small fixes with no visible feature change.
- Bump **minor** (1.0.x → 1.1.0) for a new feature or visible change — this is the normal case, and what shows in
  the navbar as `v1.1`, `v1.2`, etc.
- Bump **major** (1.x → 2.0.0) only for a rethink of the app itself.

Tell me what changed and I'll update `APP_VERSION` in `lib/version.ts`, add a line to the History comment above it,
and hand you the new build — you don't need to touch this yourself unless you want to.

## Project structure

```
app/                Next.js App Router pages (songs, record, repositories, settings, login/signup)
components/         UI building blocks (ChordLine, YouTubeEmbed, Navbar, ThemeProvider, SongCard)
lib/chords.ts        The transpose/chord-matching engine — read this first
lib/types.ts         Song / Repository types
lib/supabaseClient.ts Supabase client init
data/songs.ts        Seed chord charts (5 songs) to prove the model end-to-end
supabase/schema.sql   Full DB schema + RLS policies
```
