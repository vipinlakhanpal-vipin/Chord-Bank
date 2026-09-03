// Shared parser for the PDF and Word bulk importers. Both extract their
// file to plain text first (pdfjs-dist for PDF, mammoth for Word — see
// lib/fileTextExtract.ts) and then run through this same field-label
// parser, so a PDF and a Word doc built from the same template import
// identically. Like the Excel importer, this never authors or reproduces
// lyrics on its own — it only reshapes chart text you've already sourced
// yourself, this time out of a text/Word/PDF file instead of a
// spreadsheet.
//
// Format: one "Label: value" per line, one song per block, blocks
// separated by a "----- NEW SONG -----"-style line (see BLOCK_DELIM below —
// any line that's just that phrase plus optional dashes/other decoration).
// Recognized labels (case-insensitive), the same set the Excel template
// uses:
//   Title / Singers / Movie / Year / Genres / YouTube / Repository / Chart
// "Chart:" starts the chord chart section — every following line, up to
// the next recognized label or the end of the block, is chart content, so
// chart text itself never needs to avoid looking like "Word: value".
//
// The delimiter is deliberately the phrase "NEW SONG" rather than a bare
// run of dashes/equals/asterisks: Word's "AutoFormat As You Type" silently
// converts a lone line of "---", "===", "***" etc. (typed then Enter) into
// an invisible horizontal-rule border with no actual text in it, which
// would make that song boundary disappear from the extracted text with no
// visible sign anything was wrong. Mixing in real words sidesteps that.
import { buildParsedSongRow, ParsedSongRow, RawSongFields } from "./songRowValidation";

const LABELS: Record<string, keyof Omit<RawSongFields, "title" | "movie" | "repository">> = {
  singer: "singersRaw",
  singers: "singersRaw",
  year: "yearRaw",
  genre: "genresRaw",
  genres: "genresRaw",
  youtube: "youtubeRaw",
  "youtube link": "youtubeRaw",
  "youtube id": "youtubeRaw",
  chart: "chartRaw",
  chords: "chartRaw",
  "chord chart": "chartRaw",
  lyrics: "chartRaw",
};
const SIMPLE_LABELS: Record<string, "title" | "movie" | "repository"> = {
  title: "title",
  movie: "movie",
  film: "movie",
  repository: "repository",
  repo: "repository",
};

const BLOCK_DELIM = /^[\s\-=_~#*]*new\s+song[\s\-=_~#*]*$/i;
const LABEL_LINE = /^([A-Za-z][A-Za-z ]{1,20}):\s?(.*)$/;

export const TEXT_TEMPLATE = `Title: Tere Bina Zindagi Se
Singers: Kishore Kumar, Lata Mangeshkar
Movie: Aandhi
Year: 1975
Genres: Romantic, Classic
YouTube: https://www.youtube.com/watch?v=VIDEO_ID
Repository: Vipin
Chart:
## Verse 1
[G]Tere [D]bina zindagi [Em]se koi
[C]Shikwa [G]to nahin [D]shikwa nahin
## Chorus
[Em]Tere bina [C]zindagi bhi [G]lekin [D]zindagi to nahin

----- NEW SONG -----

Title: (next song title)
Singers: (comma separated)
Movie:
Year:
Genres: (comma separated, from Romantic/Classic/Friendship/Wedding/Party/Emotional/Devotional/Patriotic)
YouTube:
Repository:
Chart:
(paste straight from Ultimate Guitar, or already-inline [Chord]lyric text)`;

function splitBlocks(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const blocks: string[][] = [[]];
  for (const line of lines) {
    if (BLOCK_DELIM.test(line)) {
      blocks.push([]);
    } else {
      blocks[blocks.length - 1].push(line);
    }
  }
  return blocks.map((b) => b.join("\n").trim()).filter((b) => b.length > 0);
}

function parseBlock(block: string): RawSongFields {
  const fields: RawSongFields = {
    title: "",
    singersRaw: "",
    movie: "",
    yearRaw: "",
    genresRaw: "",
    youtubeRaw: "",
    repository: "",
    chartRaw: "",
  };
  const chartLines: string[] = [];
  let inChart = false;

  for (const rawLine of block.split("\n")) {
    // PDF text extraction can leave a stray leading space on a line (an
    // artifact of how the PDF encodes runs of text, not anything the user
    // typed) — trim before matching a label so "Singers: ..." is still
    // recognized as a label line even as " Singers: ...".
    const match = rawLine.trim().match(LABEL_LINE);
    const labelText = match ? match[1].trim().toLowerCase() : null;
    const simpleKey = labelText ? SIMPLE_LABELS[labelText] : undefined;
    const fieldKey = labelText ? LABELS[labelText] : undefined;

    if (match && simpleKey) {
      inChart = false;
      fields[simpleKey] = match[2].trim();
    } else if (match && fieldKey) {
      inChart = fieldKey === "chartRaw";
      const value = match[2];
      if (fieldKey === "chartRaw") {
        if (value.trim()) chartLines.push(value);
      } else {
        fields[fieldKey] = value.trim();
      }
    } else if (inChart) {
      // Same stray-leading-space artifact as above; a chord chart's layout
      // doesn't depend on leading whitespace, so trimming here only ever
      // removes noise, never anything meaningful.
      chartLines.push(rawLine.trim());
    }
  }

  fields.chartRaw = chartLines.join("\n");
  return fields;
}

/** Parses plain text (already extracted from a .docx or .pdf) into song rows, with per-row validation. */
export function parseSongsFromText(text: string): ParsedSongRow[] {
  return splitBlocks(text).map((block, i) => buildParsedSongRow(i + 1, parseBlock(block)));
}
