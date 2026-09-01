export interface Song {
  id: string;
  title: string;
  singers: string[]; // primary + featured singers
  movie?: string;
  year: number;
  language: "Hindi"; // repositories generalize this per-language
  youtubeId?: string; // just the video id, for the in-app embedded player
  // Each line is plain lyric text with chord tokens inline, e.g. "[G]Tujhe [D]dekha to [Em]yeh jaana"
  chart: string[];
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
