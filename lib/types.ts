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
  // A free-text folder you name yourself — e.g. "Vipin" — to group songs you
  // added under your own name. Optional: a song with no repository just
  // shows up everywhere, unfiltered.
  repository?: string;
}

// A repository is just a name your songs are tagged with (Song.repository) —
// this is the aggregated view for the Repositories page: the name plus how
// many songs currently carry it. Not a separate record per song.
export interface Repository {
  name: string;
  songCount: number;
}
