// Shared per-song validation used by every bulk importer (Excel, PDF, Word)
// so "Title is required", "Year must be 1950 or later" etc. mean the same
// thing and are phrased the same way everywhere a song can be bulk-added.
// The Excel importer (lib/xlsxImport.ts) predates this file and has its own
// inline copy of this same logic — this file exists so the newer PDF/Word
// importer (lib/textSongParser.ts) doesn't have to duplicate it a second
// time, without risking a regression by touching the already-tested Excel
// path to rewire it through here too.
import { Genre, GENRES } from "./types";
import { convertUgChartToInline } from "./chartImport";
import { extractYoutubeId } from "./songId";

export interface ParsedSongRow {
  rowNumber: number; // 1-based position among the songs found in the file, for user-facing messages
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

export function matchGenre(name: string): Genre | null {
  const norm = name.trim().toLowerCase();
  return GENRES.find((g) => g.toLowerCase() === norm) ?? null;
}

export interface RawSongFields {
  title: string;
  singersRaw: string;
  movie: string;
  yearRaw: string;
  genresRaw: string;
  youtubeRaw: string;
  repository: string;
  chartRaw: string;
}

/** Validates one song's already-split raw field strings into a ParsedSongRow. */
export function buildParsedSongRow(rowNumber: number, raw: RawSongFields): ParsedSongRow {
  const errors: string[] = [];

  const title = raw.title.trim();
  if (!title) errors.push("Title is required.");

  const singers = raw.singersRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (singers.length === 0) errors.push("At least one singer is required.");

  const movie = raw.movie.trim() || null;

  const yearRawTrimmed = raw.yearRaw.trim();
  const yearNum = Number(yearRawTrimmed);
  const year = yearRawTrimmed && Number.isFinite(yearNum) ? yearNum : null;
  if (!year || year < 1950) errors.push("Year must be 1950 or later.");

  const genreTokens = raw.genresRaw
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

  const youtubeRawTrimmed = raw.youtubeRaw.trim();
  const youtubeId = youtubeRawTrimmed ? extractYoutubeId(youtubeRawTrimmed) || null : null;

  const repository = raw.repository.trim() || null;

  const chartRawTrimmed = raw.chartRaw.trim();
  const chartConverted = chartRawTrimmed
    ? convertUgChartToInline(raw.chartRaw.replace(/\r\n/g, "\n").replace(/\r/g, "\n"))
    : "";
  const chart = chartConverted.split("\n");
  if (chart.filter((l) => l.trim()).length === 0) errors.push("Chart text is required.");

  return {
    rowNumber,
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
  };
}
