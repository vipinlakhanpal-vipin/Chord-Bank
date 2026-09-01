// Bump this on every push you ask for, in "major.minor.patch" form.
// Shown in the navbar as "vX.Y" (patch only shown if non-zero).
// History:
//   1.0.0 — initial release: chord/transpose engine, song library, recording studio,
//           repositories, settings, auth, YouTube embed, Chord Bank branding + logo.
export const APP_VERSION = "1.0.0";

export function formatVersion(version: string): string {
  const parts = version.split(".");
  if (parts[2] === "0") return `v${parts[0]}.${parts[1]}`;
  return `v${version}`;
}
