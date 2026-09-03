// Bulk song import from an .xlsx file. This module never authors or
// reproduces lyrics itself — it only reshapes chart text you've already
// sourced yourself into rows in your own spreadsheet, the same way the
// single-song Add form only reformats whatever you paste into it.
//
// One row = one song. Expected columns (header names are matched
// case-insensitively, and a few common variants are accepted — see
// HEADER_ALIASES below), in the order the downloadable template uses:
//   Title | Singers | Movie | Year | Genres | YouTube | Repository | Chart
//
// "Chart" can be pasted straight from Ultimate Guitar (chords on their own
// line above the lyrics) — it's run through the same auto-converter as the
// single-song form's paste handler — or already in this app's inline
// [Chord]lyric format. Use Alt+Enter (Excel) / Option+Return (Mac) inside
// the cell for multiple lines.
import * as XLSX from "xlsx";
import { Genre, GENRES } from "./types";
import { convertUgChartToInline } from "./chartImport";
import { extractYoutubeId } from "./songId";

export interface ParsedSongRow {
  rowNumber: number; // 1-based spreadsheet row, for user-facing messages
  title: string;
  singers: string[];
  movie: string | null;
  year: number | null;
  genres: Genre[];
  unknownGenres: string[];
  youtubeId: string | null;
  repository: string | null;
  chart: string[];
  errors: string[];
}

const HEADER_ALIASES: Record<string, keyof typeof FIELD_KEYS> = {
  title: "title",
  singer: "singers",
  singers: "singers",
  movie: "movie",
  film: "movie",
  year: "year",
  genre: "genres",
  genres: "genres",
  youtube: "youtube",
  "youtube id": "youtube",
  "youtube link": "youtube",
  repository: "repository",
  repo: "repository",
  chart: "chart",
  chords: "chart",
  "chord chart": "chart",
  lyrics: "chart",
};

const FIELD_KEYS = {
  title: "title",
  singers: "singers",
  movie: "movie",
  year: "year",
  genres: "genres",
  youtube: "youtube",
  repository: "repository",
  chart: "chart",
} as const;

export const TEMPLATE_HEADERS = [
  "Title",
  "Singers",
  "Movie",
  "Year",
  "Genres",
  "YouTube",
  "Repository",
  "Chart",
];

function cellText(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function matchGenre(name: string): Genre | null {
  const norm = name.trim().toLowerCase();
  return GENRES.find((g) => g.toLowerCase() === norm) ?? null;
}

/** Parses the first sheet of an uploaded .xlsx/.xls file into song rows, with per-row validation. */
export function parseSongsWorkbook(buffer: ArrayBuffer): ParsedSongRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];
  const sheet = workbook.Sheets[firstSheetName];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
  });
  if (rows.length === 0) return [];

  // Map each recognized header to its column index, wherever it happens to be.
  const headerRow = rows[0].map((h) => cellText(h).toLowerCase());
  const colIndex: Partial<Record<string, number>> = {};
  headerRow.forEach((h, i) => {
    const field = HEADER_ALIASES[h];
    if (field && colIndex[field] === undefined) colIndex[field] = i;
  });

  const get = (row: unknown[], field: keyof typeof FIELD_KEYS): string => {
    const idx = colIndex[field];
    return idx === undefined ? "" : cellText(row[idx]);
  };

  const results: ParsedSongRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const isBlank = row.every((c) => cellText(c) === "");
    if (isBlank) continue;

    const errors: string[] = [];

    const title = get(row, "title");
    if (!title) errors.push("Title is required.");

    const singersRaw = get(row, "singers");
    const singers = singersRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (singers.length === 0) errors.push("At least one singer is required.");

    const movie = get(row, "movie") || null;

    const yearRaw = get(row, "year");
    const yearNum = Number(yearRaw);
    const year = yearRaw && Number.isFinite(yearNum) ? yearNum : null;
    if (!year || year < 1950) errors.push("Year must be 1950 or later.");

    const genresRaw = get(row, "genres");
    const genreTokens = genresRaw
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);
    const genres: Genre[] = [];
    const unknownGenres: string[] = [];
    for (const token of genreTokens) {
      const matched = matchGenre(token);
      if (matched) genres.push(matched);
      else unknownGenres.push(token);
    }

    const youtubeRaw = get(row, "youtube");
    const youtubeId = youtubeRaw ? extractYoutubeId(youtubeRaw) || null : null;

    const repository = get(row, "repository") || null;

    const chartRaw = get(row, "chart");
    const chartConverted = chartRaw ? convertUgChartToInline(chartRaw.replace(/\r\n/g, "\n").replace(/\r/g, "\n")) : "";
    const chart = chartConverted.split("\n");
    if (chart.filter((l) => l.trim()).length === 0) errors.push("Chart text is required.");

    results.push({
      rowNumber: i + 1,
      title,
      singers,
      movie,
      year,
      genres,
      unknownGenres,
      youtubeId,
      repository,
      chart,
      errors,
    });
  }
  return results;
}

/** Builds the downloadable .xlsx template (header row + one filled-in example row). */
export function buildTemplateWorkbook(): Uint8Array {
  const exampleRow = [
    "Tere Bina Zindagi Se",
    "Kishore Kumar, Lata Mangeshkar",
    "Aandhi",
    "1975",
    "Romantic, Classic",
    "https://www.youtube.com/watch?v=VIDEO_ID",
    "Vipin",
    "## Verse 1\n[G]Tere [D]bina zindagi [Em]se koi\n[C]Shikwa [G]to nahin [D]shikwa nahin\n## Chorus\n[Em]Tere bina [C]zindagi bhi [G]lekin [D]zindagi to nahin",
  ];
  const sheetData = [TEMPLATE_HEADERS, exampleRow];
  const sheet = XLSX.utils.aoa_to_sheet(sheetData);
  sheet["!cols"] = [
    { wch: 24 }, { wch: 24 }, { wch: 16 }, { wch: 8 },
    { wch: 20 }, { wch: 28 }, { wch: 14 }, { wch: 60 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Songs");
  const out = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Uint8Array(out);
}
