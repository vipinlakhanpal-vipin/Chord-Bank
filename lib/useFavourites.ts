"use client";

import { useEffect, useState } from "react";
import { getFavourites } from "./favourites";

// Live list of favourited song IDs — re-reads whenever any HeartButton
// toggles one, so the Favourites page/tab stays in sync without a refresh.
export function useFavouriteIds(): string[] {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(getFavourites());
    const handler = () => setIds(getFavourites());
    window.addEventListener("cb:favourites-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("cb:favourites-changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return ids;
}
