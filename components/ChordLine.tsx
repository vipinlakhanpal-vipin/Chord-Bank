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
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}
