export default function ChordLine({ line }: { line: string }) {
  if (line.startsWith("## ")) {
    return <div className="section-label">{line.slice(3)}</div>;
  }

  if (line === "") {
    return <div className="h-2" aria-hidden="true" />;
  }

  const parts = line.split(/(\[[A-G][#b]?m?(?:in)?\])/g);
  return (
    <div className="leading-loose">
      {parts.map((part, i) => {
        const m = part.match(/^\[([A-G][#b]?m?(?:in)?)\]$/);
        if (m) {
          return (
            <span key={i} className="chord-token">
              {m[1]}
            </span>
          );
        }
        return <span key={i}>{renderFormattedText(part, `t${i}`)}</span>;
      })}
    </div>
  );
}

// **bold** and *italic* work inside the lyric text (never inside the
// [Chord] tags themselves, which are matched out above before this ever
// runs) — type the markers straight into the Chord chart box in Add/Edit
// Song, or use that box's Bold/Italic toolbar buttons, which insert exactly
// this markup around your selected text.
function renderFormattedText(text: string, keyPrefix: string) {
  const segments = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return segments.map((seg, i) => {
    if (!seg) return null;
    if (seg.startsWith("**") && seg.endsWith("**") && seg.length >= 5) {
      return <strong key={`${keyPrefix}-${i}`}>{seg.slice(2, -2)}</strong>;
    }
    if (seg.startsWith("*") && seg.endsWith("*") && seg.length >= 3) {
      return <em key={`${keyPrefix}-${i}`}>{seg.slice(1, -1)}</em>;
    }
    return <span key={`${keyPrefix}-${i}`}>{seg}</span>;
  });
}
