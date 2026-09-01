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
export const APP_VERSION = "1.4.0";

export function formatVersion(version: string): string {
  const parts = version.split(".");
  if (parts[2] === "0") return `v${parts[0]}.${parts[1]}`;
  return `v${version}`;
}
