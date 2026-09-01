// Chord Bank mark, Option B: a guitar pick set inside a rounded "vault" ring —
// reads as "a bank/vault that holds picks (chords)". Teal-to-indigo gradient.
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
          <stop offset="0%" stopColor="#0EA5A0" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
      </defs>

      {/* rounded tile */}
      <rect x="1" y="1" width="46" height="46" rx="13" fill="url(#cb-bg)" />
      <rect x="1" y="1" width="46" height="46" rx="13" stroke="white" strokeOpacity="0.15" />

      {/* vault ring */}
      <circle cx="24" cy="24" r="13" fill="white" fillOpacity="0.12" />
      <circle cx="24" cy="24" r="13" stroke="white" strokeOpacity="0.9" strokeWidth="1.5" />

      {/* guitar pick */}
      <path
        d="M24 14c5 0 8 4.2 8 8.8 0 5.6-4.6 10.7-8 11.7-3.4-1-8-6.1-8-11.7 0-4.6 3-8.8 8-8.8Z"
        fill="white"
      />
      <circle cx="24" cy="21" r="2.1" fill="#4338CA" />
    </svg>
  );
}
