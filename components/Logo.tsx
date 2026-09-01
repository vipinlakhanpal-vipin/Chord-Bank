// Chord Bank mark: a rounded "vault/bank" tile holding a stylized chord-diagram
// grid (strings + a fret bar), so it reads as "a bank of chords" at a glance.
// Pure inline SVG — scales cleanly, themes with currentColor + two accent stops.
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cb-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF9933" />
          <stop offset="55%" stopColor="#D6336C" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
      </defs>

      {/* rounded tile */}
      <rect x="1" y="1" width="46" height="46" rx="13" fill="url(#cb-bg)" />
      <rect x="1" y="1" width="46" height="46" rx="13" stroke="white" strokeOpacity="0.15" />

      {/* chord-diagram grid: nut + 3 frets, 4 strings */}
      <g stroke="white" strokeWidth="1.6" strokeLinecap="round">
        {/* nut (thicker top bar) */}
        <line x1="12" y1="14" x2="36" y2="14" strokeWidth="3" />
        {/* fret lines */}
        <line x1="12" y1="21" x2="36" y2="21" strokeOpacity="0.85" />
        <line x1="12" y1="28" x2="36" y2="28" strokeOpacity="0.85" />
        <line x1="12" y1="35" x2="36" y2="35" strokeOpacity="0.6" />
        {/* strings */}
        <line x1="14" y1="14" x2="14" y2="35" strokeOpacity="0.85" />
        <line x1="20.7" y1="14" x2="20.7" y2="35" strokeOpacity="0.85" />
        <line x1="27.3" y1="14" x2="27.3" y2="35" strokeOpacity="0.85" />
        <line x1="34" y1="14" x2="34" y2="35" strokeOpacity="0.85" />
      </g>

      {/* finger dots forming a simple open-chord shape */}
      <circle cx="20.7" cy="24.5" r="2.6" fill="white" />
      <circle cx="27.3" cy="31.5" r="2.6" fill="white" />
      <circle cx="34" cy="24.5" r="2.6" fill="white" />
    </svg>
  );
}
