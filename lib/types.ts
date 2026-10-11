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
  // Public URL of a recording YOU uploaded for this song (your own singing/
  // playing, not the original) — stored in the Supabase 'recordings' bucket.
  // One per song; a fresh upload overwrites the previous one.
  recordingUrl?: string;
  // Each line is either a lyric line with inline chord tokens like
  // "[G]Tujhe [D]dekha to [Em]yeh jaana", a section label written as
  // "## Verse 1" / "## Chorus" / "## Bridge" etc., or "" for a blank spacer.
  chart: string[];
  genres: Genre[];
  tags?: string[];
  addedVia: "seed" | "manual" | "ai-workflow";
  // Free-text folders you name yourself — e.g. "Vipin", "Guitar Favourite",
  // "Amit Kumar" — to group songs under. A song can belong to more than one
  // at once (the same song can be both your own favourite AND filed under a
  // singer's name), or none, in which case it just shows up everywhere,
  // unfiltered. Always an array, defaults to empty rather than undefined.
  repositories: string[];
}

// A repository is just a name your songs are tagged with (Song.repositories)
// — this is the aggregated view for the Repositories page: the name plus how
// many songs currently carry it. Not a separate record per song.
export interface Repository {
  name: string;
  songCount: number;
}
