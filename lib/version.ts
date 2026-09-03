// Bump this on every push you ask for, in "major.minor.patch" form.
// Shown in the navbar as "vX.Y" (patch only shown if non-zero).
// History:
//   1.0.0 — initial release: chord/transpose engine, song library, recording studio,
//           repositories, settings, auth, YouTube embed, Chord Bank branding + logo.
//   1.1.0 — full multi-verse chord charts (not just 4 lines), denser 2-4 column colorful
//           song grid, small YouTube "Listen" popup instead of a big embed, "Created by
//           Vipin" credit line under the logo.
//   1.2.0 — installable as an app (PWA manifest + service worker) on both desktop and
//           mobile home screen; explicit Home button; mobile bottom nav (Home, Search,
//           Aria assistant placeholder with animated icon, Updates, Settings, Refresh);
//           red-dot badges — Updates button when new songs are added, Refresh button
//           when a new deploy is detected; mobile layout stability fixes (no more
//           horizontal jump or input-triggered zoom jump); 3 alternate logo concepts
//           delivered for review, current logo unchanged pending your pick.
//   1.2.1 — applied Logo Option B (pick-in-a-vault, teal-to-indigo) as the app's logo
//           and app icon everywhere; theme color updated to match.
//   1.3.0 — fixed desktop mouse-wheel scroll (overscroll-behavior-y was set to "none",
//           a known cause of dead-feeling wheel scroll in some browsers; changed to
//           "contain"); YouTube popup is now draggable anywhere on screen; chord charts
//           show real song structure (Intro/Verse/Chorus/Bridge/Outro section labels)
//           instead of blank-line spacing; replaced the single "group by singer"
//           checkbox with real filters (Year, Singer, Genre) plus a By Singer/All Songs
//           pill toggle; song tiles are smaller and denser (2 to 8 per row depending on
//           screen width); added Prev/Next pagination for the All Songs view; Nunito
//           font applied app-wide; navbar switched from sticky to truly fixed so it
//           never scrolls away; nav tabs are now true pills — only the active tab gets
//           the filled pill, inactive tabs are plain text.
//   1.3.1 — fixed mobile navbar overlap (desktop tabs were never hidden on small
//           screens — now only logo+theme toggle show there, everything else lives in
//           the bottom nav); grid pushed denser (3 to 10 tiles per row); redesigned
//           filter dropdowns with a custom chevron instead of default OS select chrome;
//           Aria icon replaced with a fixed AI-spark glyph plus one small dot genuinely
//           orbiting it (smaller, less raised, purple); Updates icon changed from a book
//           to a bell.
//   1.4.0 — Favourites: heart icon on every song tile and on the song detail page,
//           turns green when tapped; "Favourite" tab on desktop, "Favourites" tab on
//           the mobile bottom nav, both listing your hearted songs; removed the
//           duplicate "Songs" tab (Home already goes there) to reduce clutter;
//           versioning convention going forward: every shipped update bumps the
//           displayed number by one whole step (v1.3 -> v1.4 -> v1.5...), no more
//           hidden decimal patch versions.
//   1.5.0 — first daily song batch: 10 new songs added (Ek Ladki Ko Dekha Toh Aisa
//           Laga, Chura Liya Hai Tumne, Yeh Jo Mohabbat Hai, Papa Kehte Hain, Ae Mere
//           Humsafar, Kabhi Kabhie Mere Dil Mein, Tere Bina Zindagi Se, Pal Pal Dil Ke
//           Paas, Zindagi Pyar Ka Geet Hai, Tum Aa Gaye Ho), each with real chorus +
//           verse structure, chords, and a verified YouTube link. Tagged
//           "best-effort" since lyrics are recalled rather than sourced from an
//           official lyric sheet — flag any line that's off and it'll be corrected.
//   1.6.0 — removed the mobile "Search" tab from the bottom nav (Home already has a
//           search box at the top, so it was a duplicate); bottom nav is back to 6
//           icons: Home, Aria, Updates, Favourites, Settings, Refresh.
//   1.7.0 — mobile readability pass: bigger title/singer/badge text and more card
//           padding on phone screens (still 3 tiles per row, just easier to read),
//           slightly tighter page/grid margins to make room for it; YouTube popup
//           now has an "Open on YouTube" fallback link for videos whose owner has
//           disabled in-app embedding (the popup would otherwise show blank).
//   1.8.0 — version badge next to the logo is now always visible (desktop AND
//           mobile) since you check it every time to confirm a deploy landed;
//           no other layout changes — the desktop-tabs-on-mobile issue you saw
//           is a stale-deploy symptom, not a code bug (see chat for the exact
//           redeploy steps that clear it).
//   1.9.0 — real bug found and fixed: Record and Repositories had no way to be
//           opened on mobile at all (the top tab row that held them is desktop-only,
//           and the bottom nav never included them). Added small Record (mic) and
//           Repositories (stack) icons next to the logo on mobile so both pages are
//           reachable again.
//   2.0.0 — mobile header legibility pass: version badge is now bold teal (was
//           faint grey, hard to read on dark mode) instead of blending in; Record
//           and Repositories are now labeled pill buttons ("Rec" / "Repo" with an
//           icon) instead of unlabeled icons, so they read as tappable tabs, not
//           decoration.
//   2.1.0 — "Created by Vipin" credit line brightened to a bold colored line
//           (was near-invisible at 20% opacity grey).
//   2.2.0 — second daily song batch: 10 more songs (Tum Se Hi, Iktara, Channa Mereya,
//           Agar Tum Saath Ho, Raabta, Phir Le Aya Dil, Tera Ban Jaunga, Hasi, Tum Hi
//           Aana, Bachna Ae Haseeno) — 25 songs in the library now. Same chorus+verse
//           structure, chords, and a verified YouTube link per song as the first batch.
//   2.3.0 — third daily song batch: 10 more songs (Chingari Koi Bhadke, Rimjhim Gire
//           Sawan, Tere Mere Beech Mein, Pehla Nasha, Kuch Kuch Hota Hai, Tujh Mein
//           Rab Dikhta Hai, Ajab Si, Tera Hone Laga Hoon, Kabira, Khairiyat) — 35
//           songs in the library now, spanning 1972-2019. Same chorus+verse structure,
//           chords, and a verified YouTube link per song as the first two batches.
//           Also fixed a real bug found while auditing the whole library against the
//           transpose engine: 3 existing songs (Kal Ho Naa Ho, Chura Liya Hai Tumne,
//           Raabta) used a second chord outside the 6-chord family (a stray Em
//           alongside Am, or a full E alongside Am) that made them silently
//           unplayable even with a shift — every song in the library now actually
//           passes the app's own playability check, not just the new ones.
//   2.04 — versioning convention changed again, this time for good: whole-number
//           steps (v1.0 -> v2.3) were too coarse, so it's back to a decimal minor,
//           but two digits instead of the original single digit — v2.04, v2.05,
//           ... up to v2.99, then the next change rolls to v3.00. A tiny fix that
//           doesn't deserve its own minor step bumps a third "patch" digit instead
//           (shown only when non-zero, e.g. v2.04.1) and resets at the next minor
//           bump. Everything before this line keeps its old whole-number label
//           (v1.0 ... v2.3) — only new entries use the new format.
//   2.05 — real bug fix: the "All Songs" grid paginated after just 24 tiles
//           regardless of screen width, so on a wide desktop (10 columns) it cut
//           to "Page 1 of 2" after only ~2.5 rows, leaving a lot of empty space
//           below before you'd hit Prev/Next. Page size raised to 60 — the whole
//           current library now fits on one page with no pagination controls at
//           all, and it'll keep filling the screen properly as more songs are added.
//   2.06 — Year/Singer/Genre/Only playable filter pills now each get their own
//           tinted color (saffron/indigo/magenta/teal) instead of all sharing one
//           plain grey-until-selected look, matching the colored badges already
//           used on song tiles; added a "35 songs in the library" counter next
//           to them so the total library size is visible without counting tiles.
//   1.26 — version number deliberately restarted at v1.26 per request (not a
//           rollback — nothing from v2.06 was undone). From here it counts up
//           normally — v1.27, v1.28, ... — through v1.99, then the change after
//           that rolls to v2.0.
//   1.27 — Rec/Repo pill buttons (top-right, mobile) are now a touch bigger and
//           always show their tinted background (teal/saffron) even when not
//           the active page, instead of a bare outline that was easy to miss;
//           By Singer/All Songs toggle now gets the same colored-pill treatment
//           as the filter row (indigo/teal) instead of one plain grey option;
//           fixed YouTube "Listen" popup videos getting stuck on an endless
//           loading spinner for most songs — the popup was requesting
//           autoplay, which Chrome silently blocks unless the play tap happens
//           inside the YouTube frame itself, so it just hung with nothing
//           visibly wrong; now loads the normal YouTube thumbnail + play
//           button, one extra tap but it starts every time; added instant
//           press feedback (a quick scale-down) to the mobile bottom nav
//           buttons so switching tabs feels immediate even while the next
//           page's content loads in.
//   1.28 — Big one: removed all 35 demo songs from the codebase. Several had
//           lyrics cross-contaminated between different songs (verses from
//           the wrong song entirely) from being recalled from memory instead
//           of sourced — a real accuracy failure, and on top of that, full
//           commercial song lyrics aren't something this app can generate or
//           ship on its own regardless of accuracy. In their place: a real
//           Add Song / Edit Song / Delete Song flow (login required to write,
//           open to browse) backed by your own Supabase `songs` table — you
//           paste in chart text you've sourced yourself, the app never
//           authors lyric content. Home, Favourites, the song detail page,
//           and the Updates bell all now read live from Supabase instead of
//           a hardcoded file. Repositories page copy corrected to stop
//           promising an AI ingestion pipeline that was never going to be
//           buildable. Needs a one-line schema migration — see README.
//           Also: the Chord chart box now auto-converts a paste straight
//           from Ultimate Guitar (chords on their own line above the lyrics)
//           into this app's inline [Chord]lyric format automatically — no
//           manual reformatting needed before it's playable/transposable.
//           Already-inline text pastes through unchanged, and you can still
//           hand-move any [Chord] tag afterward if the placement is off.
//   1.29 — Real bug fix: mouse wheel scrolling could go dead on desktop
//           browsers — html and body both set overflow-x:hidden, which on
//           some browsers makes <html> its own scroll container instead of
//           the normal viewport scroll; overflow-x is now set on body only.
//           Genre tags (Add Song) and the Rec/Repo pills each get their own
//           solid color now instead of one washed-out tint repeated. Home's
//           "+ Add Song" spot on both the desktop navbar and the mobile
//           bottom bar now replaces the redundant Home icon (the logo/title
//           already goes home) — that's the button you'll use constantly.
//           "Chord Bank" brand text recolored to turquoise. Home heading
//           renamed to "Welcome to Vipin's Chords Bank".
//   1.30 — Every pill-shaped tab in the app now uses the solid gradient-fill
//           look from your reference image (colored background + white text,
//           no border) instead of the washed-out tinted-outline style:
//           Genre tags on Add Song, the Year/Singer/Genre filter pills and
//           "Only playable" / "By Singer"/"All Songs" toggles on Home, the
//           Add Song button (navbar + Home card), the active Record/
//           Repositories/Favourite/Settings tab, and the mobile Rec/Repo
//           pills. Unselected pills stay dimmed instead of switching to an
//           outline, so every tab always reads as a real filled color.
//   1.31 — Real repositories: Add Song now has a Repository field (type a
//           name like "Vipin" — pick an existing one or create a new one on
//           the fly), Home gets a Repository filter pill next to Year/
//           Singer/Genre, and the Repositories page shows real gradient
//           chips per repository with a live song count, linking straight
//           to Home pre-filtered to that repository. Also: Home was only
//           reachable via the logo after the bottom nav's Home button was
//           replaced with Add Song — a dedicated Home tab is back on mobile,
//           right next to Add Song, so the song list + filters are never
//           more than one tap away. Edit/Delete on a song page now show as
//           solid color pills instead of faint outlines, and explicitly
//           say "Log in to edit or delete" when you're signed out, instead
//           of just silently not showing up. Also: the top and bottom nav
//           bars could visibly jump mid-scroll on iOS Safari (the address
//           bar animating away resizes the viewport, and a plain fixed
//           element can re-settle against that mid-frame) — both are now
//           pinned to their own GPU layer so they stay put while you scroll.
//   1.31.1 — Real bug fix: "Only playable" and "All Songs" were nearly
//            invisible — their dimmed teal pill was faded to 50% opacity on
//            top of an already-dark teal/cyan gradient, which all but
//            vanished against the app's dark background. Dimmed pills now
//            stay at a visible 65%+ opacity and use lighter gradient tones.
//   1.31.2 — Real bug fix, the actual root cause of the last one: this app's
//            tailwind.config.ts defines "teal", "indigo", "saffron",
//            "magenta" and "turquoise" as flat brand colors, which silently
//            wipes out Tailwind's own numbered shade scale for those names —
//            so any class like "from-teal-500" or "to-indigo-600" generated
//            no CSS at all. That's why "Only playable", "All Songs", the Add
//            Song pills, the Repositories chips, and the Devotional genre
//            chip were rendering with a missing or partial background.
//            Replaced every one with a real full-shade-scale color (cyan,
//            blue, violet, etc.) that looks the same but actually renders.
//   1.32 — Real fixes based on feedback: every pill (Genre, filters, Only
//           playable, By Singer/All Songs, Add Song, Rec/Repo) is now at
//           FULL brightness all the time instead of dimmed-until-selected —
//           the selected one just gets an extra white ring on top of that
//           same full color, so the whole row stays bright. Added an
//           explicit "Home" link next to Record/Repositories/Favourite/
//           Settings on desktop. Edit and Delete now show right on each
//           song tile (not just after opening the song) when you're logged
//           in. Your 3 existing songs are now tagged under the "Vipin"
//           repository, and every new song defaults to "Vipin" in the
//           Repository field (still fully editable/clearable).
//   1.33 — Song tile layout: moved Edit and Delete off the top-left corner
//           (was overlapping the title) down to a bottom action row —
//           Edit bottom-left, Delete bottom-right, with the playable
//           checkmark/shift badge dead-center between them. The checkmark
//           badge is now a solid bright green pill (was a faint 10%-opacity
//           tint) to match the "always full color" pill style everywhere
//           else in the app. Also: the Repositories page's "Create a new
//           repository" box (including the Create button) only ever
//           rendered when you were logged in — with no signed-out state at
//           all it just silently disappeared, which is exactly what "the
//           Create button isn't visible" looks like. Now shows an explicit
//           "Log in to create a new repository" message instead, same
//           pattern already used on the song detail page's Edit/Delete.
//   1.33.1 — Found it: the Repositories page's "Create" button was never
//            actually missing — it was disabled (and 50%-opacity-dimmed)
//            whenever the name box was empty, which on the dark theme
//            reads as "not there at all" until you start typing. Button
//            is now full bright color always; an empty name shows "Give
//            the repository a name" underneath instead of hiding the button.
//   1.34 — Bulk song import from Excel: a new "Import from Excel" page
//           (linked from the Add Song form) takes an .xlsx file — one row
//           per song (Title, Singers, Movie, Year, Genres, YouTube,
//           Repository, Chart) — parses and validates every row, shows a
//           review table with per-row problems flagged, and imports
//           whichever rows you check. Chart text auto-converts from an
//           Ultimate-Guitar-style paste the same way the single-song form
//           does. A "Download template" button gives you a ready-made
//           .xlsx with the right columns and one filled-in example row.
//           Like every other import path in this app, it never authors or
//           reproduces lyrics on its own — it only reshapes chart text you
//           already sourced yourself into rows in your own spreadsheet.
//           PDF and Word import are next.
export const APP_VERSION = "1.34.0";

// Display format: vMAJOR.MINOR (minor zero-padded to 2 digits), with an optional
// third "patch" digit appended only when it's non-zero, e.g. v2.04 or v2.04.1.
// Bump MINOR by 1 for a normal shipped change; roll MINOR 99 -> 00 and bump MAJOR
// for the change after that; reserve PATCH for a fix too small to deserve its own
// MINOR step.
export function formatVersion(version: string): string {
  const [major, minor, patch] = version.split(".");
  const minorPadded = minor.padStart(2, "0");
  if (!patch || patch === "0") return `v${major}.${minorPadded}`;
  return `v${major}.${minorPadded}.${patch}`;
}
