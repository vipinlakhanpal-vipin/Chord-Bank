// Converts a chart pasted straight from Ultimate Guitar (or any site using the
// same convention) into this app's inline "[Chord]lyric" format.
//
// Ultimate Guitar's default layout is two lines per couplet: a line of chord
// symbols positioned with spaces above a plain lyric line, e.g.
//
//   G          D
//   Tere bina zindagi se koi
//
// This app's chord engine (lib/chords.ts) only recognizes chords written
// inline as [G]Tere [D]bina zindagi..., so pasting the two-line format in
// as-is would show no chords at all and no playability result. This module
// is a pure text transform — it never touches word content, only moves
// characters around — so it doesn't "write" any lyrics, it just reformats
// whatever text you already pasted in.

// A reasonably permissive chord-symbol matcher: root + accidental + quality/
// extension characters + an optional /bass note (e.g. G, Em, C#m7, D/F#, Asus4).
const CHORD_TOKEN_RE =
  /^[A-G](#|b)?(m|min|maj)?[0-9]*(sus[24]?)?(add[0-9]+)?(dim|aug)?(\/[A-G](#|b)?)?$/i;

// A line made up ENTIRELY of chord-looking tokens (and whitespace) is treated
// as a chord line rather than a lyric line. A lone word that happens to look
// like a chord symbol (e.g. a one-word line "A") can false-positive here —
// a rare enough edge case that it's not worth the complexity of avoiding.
function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const tokens = trimmed.split(/\s+/);
  return tokens.length > 0 && tokens.every((t) => CHORD_TOKEN_RE.test(t));
}

const SECTION_KEYWORDS =
  /^(intro|verse|chorus|pre-chorus|prechorus|bridge|outro|interlude|hook|refrain|antara|mukhda)\b/i;

function isSectionLabelLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 40) return false;
  const bracketMatch = trimmed.match(/^\[(.+)\]$/);
  const inner = (bracketMatch ? bracketMatch[1] : trimmed.replace(/:$/, "")).trim();
  return SECTION_KEYWORDS.test(inner);
}

function normalizeSectionLabel(line: string): string {
  const trimmed = line.trim();
  const bracketMatch = trimmed.match(/^\[(.+)\]$/);
  return (bracketMatch ? bracketMatch[1] : trimmed.replace(/:$/, "")).trim();
}

/** Insert each chord token into the lyric line at the same character column it sat at above it. */
function mergeChordAndLyric(chordLine: string, lyricLine: string): string {
  const matches = Array.from(chordLine.matchAll(/\S+/g)).map((m) => ({
    text: m[0],
    index: m.index ?? 0,
  }));
  let result = lyricLine;
  let shift = 0;
  for (const c of matches) {
    const pos = c.index + shift;
    if (pos > result.length) {
      result = result.padEnd(pos, " ");
    }
    const token = `[${c.text}]`;
    result = result.slice(0, pos) + token + result.slice(pos);
    shift += token.length;
  }
  return result.replace(/[ \t]+$/, "");
}

/**
 * Convert a raw chart (two-line "chords above lyrics" format) into this app's
 * inline bracket format. Text that's already inline (or plain lyrics with no
 * chords at all) passes through unchanged, so this is safe to run on
 * anything — including a chart that's already in the right format.
 */
export function convertUgChartToInline(raw: string): string {
  const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (isSectionLabelLine(line)) {
      out.push(`## ${normalizeSectionLabel(line)}`);
      i++;
      continue;
    }

    if (isChordLine(line)) {
      const next = lines[i + 1];
      const nextIsLyric = next !== undefined && next.trim() !== "" && !isChordLine(next) && !isSectionLabelLine(next);
      if (nextIsLyric) {
        out.push(mergeChordAndLyric(line, next));
        i += 2;
      } else {
        // Standalone chord line (e.g. an instrumental bar) — no lyric to merge into.
        const tokens = Array.from(line.matchAll(/\S+/g)).map((m) => `[${m[0]}]`);
        out.push(tokens.join(" "));
        i += 1;
      }
      continue;
    }

    out.push(line);
    i++;
  }
  return out.join("\n");
}
