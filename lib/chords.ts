// ---------------------------------------------------------------------------
// Chord engine, deliberately scoped to the 6 chords you actually play:
// A, E, Em, G, C, D. Everything here works with that constraint, not around it.
// ---------------------------------------------------------------------------

export type Quality = "maj" | "min";

export interface Chord {
  root: number; // 0=C, 1=C#, 2=D ... 11=B (chromatic index)
  quality: Quality;
}

export const NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
];

// The only chords you play. This is the whole point of the app.
export const YOUR_CHORDS: Chord[] = [
  { root: 9, quality: "maj" }, // A
  { root: 4, quality: "maj" }, // E
  { root: 4, quality: "min" }, // Em
  { root: 7, quality: "maj" }, // G
  { root: 0, quality: "maj" }, // C
  { root: 2, quality: "maj" }, // D
];

export function chordName(c: Chord): string {
  const base = NOTE_NAMES[((c.root % 12) + 12) % 12];
  return c.quality === "min" ? `${base}m` : base;
}

// Parse strings like "A", "Em", "G", "D", "C#m", "Bb" etc into a Chord.
export function parseChord(symbol: string): Chord | null {
  const m = symbol.trim().match(/^([A-G])(#|b)?(m|min)?/i);
  if (!m) return null;
  const letterIndex: Record<string, number> = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  };
  let root = letterIndex[m[1].toUpperCase()];
  if (m[2] === "#") root = (root + 1) % 12;
  if (m[2] === "b") root = (root + 11) % 12;
  const quality: Quality = m[3] ? "min" : "maj";
  return { root, quality };
}

export function isYourChord(c: Chord): boolean {
  return YOUR_CHORDS.some((y) => y.root === c.root && y.quality === c.quality);
}

export function transposeChord(c: Chord, semitones: number): Chord {
  return { root: (((c.root + semitones) % 12) + 12) % 12, quality: c.quality };
}

/**
 * Given the set of chords a song actually uses, find every transposition
 * (0-11 semitones, i.e. every capo position / key shift) after which EVERY
 * chord in the song lands on one of your 6 chords (A, E, Em, G, C, D).
 *
 * Returns a list of viable shifts, best-sounding first (fewest chord changes
 * from the original, i.e. shift 0 preferred, then closest shifts).
 */
export function findPlayableTranspositions(songChords: Chord[]): number[] {
  const uniqueChords = dedupe(songChords);
  const viable: number[] = [];
  for (let shift = 0; shift < 12; shift++) {
    const ok = uniqueChords.every((c) => isYourChord(transposeChord(c, shift)));
    if (ok) viable.push(shift);
  }
  // Prefer smaller absolute shifts (less capo movement / easier to reason about)
  return viable.sort((a, b) => {
    const da = a <= 6 ? a : 12 - a;
    const db = b <= 6 ? b : 12 - b;
    return da - db;
  });
}

function dedupe(chords: Chord[]): Chord[] {
  const seen = new Set<string>();
  const out: Chord[] = [];
  for (const c of chords) {
    const key = `${c.root}-${c.quality}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(c);
    }
  }
  return out;
}

/** Apply a semitone shift to every chord token inside a chord-over-lyrics line. */
export function transposeLine(line: string, semitones: number): string {
  // Chord tokens are wrapped like [G] [Em] [D] inside lyric lines.
  return line.replace(/\[([A-G][#b]?m?(?:in)?)\]/g, (_match, sym: string) => {
    const c = parseChord(sym);
    if (!c) return `[${sym}]`;
    return `[${chordName(transposeChord(c, semitones))}]`;
  });
}

export function extractChordsFromChart(lines: string[]): Chord[] {
  const chords: Chord[] = [];
  for (const line of lines) {
    const matches = line.matchAll(/\[([A-G][#b]?m?(?:in)?)\]/g);
    for (const m of matches) {
      const c = parseChord(m[1]);
      if (c) chords.push(c);
    }
  }
  return chords;
}

/** How many of a song's chords are already within your 6 — used for a match score. */
export function matchScore(songChords: Chord[]): { playableAsIs: boolean; bestShift: number | null } {
  const shifts = findPlayableTranspositions(songChords);
  if (shifts.length === 0) return { playableAsIs: false, bestShift: null };
  return { playableAsIs: shifts.includes(0), bestShift: shifts[0] };
}
