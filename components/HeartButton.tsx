"use client";

import { useEffect, useState } from "react";
import { isFavourite, toggleFavourite } from "@/lib/favourites";

export default function HeartButton({
  songId,
  size = 14,
  className = "",
}: {
  songId: string;
  size?: number;
  className?: string;
}) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavourite(songId));
  }, [songId]);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setFav(toggleFavourite(songId));
      }}
      aria-label={fav ? "Remove from favourites" : "Add to favourites"}
      title={fav ? "Remove from favourites" : "Add to favourites"}
      className={`shrink-0 ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fav ? "#16A34A" : "none"}
        stroke={fav ? "#16A34A" : "currentColor"}
        strokeWidth="2"
      >
        <path
          d="M12 21s-6.7-4.35-9.3-8.1C1 10.2 1.6 6.6 4.6 5.1 7 3.9 9.6 4.7 12 7.3c2.4-2.6 5-3.4 7.4-2.2 3 1.5 3.6 5.1 1.9 7.8C18.7 16.65 12 21 12 21Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
