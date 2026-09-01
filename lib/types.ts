// Fixed genre vocabulary so the filter UI stays predictable — extend this
// list (and re-tag songs) rather than letting free-text genres pile up.
export const GENRES = [
  "Romantic",
  "Classic",
  "Friendship",
  "Wedding",
  "Party",
  "Emotional",
  "Devotional",
  "Patriotic",
] as const;

export type Genre = (typeof GENRES)[number];

export interface Song {
  id: string;
  title: string;
  singers: string[]; // primary + featured singers
  movie?: string;
  year: number;
  language: "Hindi"; // repositories generalize this per-language
  youtubeId?: string; // just the video id, for the in-app embedded player
  // Each line is either a lyric line with inline chord tokens like
  // "[G]Tujhe [D]dekha to [Em]yeh jaana", a section label written as
  // "## Verse 1" / "## Chorus" / "## Bridge" etc., or "" for a blank spacer.
  chart: string[];
  genres: Genre[];
  tags?: string[];
  addedVia: "seed" | "manual" | "ai-workflow";
}

export interface Repository {
  id: string;
  language: string;
  yearFrom: number;
  yearTo: number;
  status: "pending" | "in-progress" | "complete";
  songCount: number;
  createdAt: string;
}
