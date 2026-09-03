// Small pure helpers shared between the single-song Add form and the bulk
// Excel/PDF/Word importers, so a song gets the same id/YouTube-id logic no
// matter which path added it.

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function extractYoutubeId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const watchMatch = trimmed.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = trimmed.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = trimmed.match(/embed\/([A-Za-z0-9_-]{6,})/);
  if (embedMatch) return embedMatch[1];
  // Otherwise assume they pasted the raw video id already.
  return trimmed;
}
