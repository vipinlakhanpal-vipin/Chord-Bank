"use client";

import { SONGS } from "@/data/songs";
import SongCard from "@/components/SongCard";
import { useFavouriteIds } from "@/lib/useFavourites";

const GRID = "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5 sm:gap-2";

export default function FavouritesPage() {
  const ids = useFavouriteIds();
  const songs = SONGS.filter((s) => ids.includes(s.id));

  return (
    <div className="flex flex-col gap-5">
      <div className="card p-4">
        <h1 className="text-xl font-display font-bold mb-1">Your Favourites</h1>
        <p className="text-sm text-ink/60 dark:text-cream/60">
          Songs you&apos;ve hearted, all in one place.
        </p>
      </div>

      {songs.length === 0 ? (
        <p className="text-sm text-ink/50 dark:text-cream/50">
          No favourites yet — tap the heart on any song to add it here.
        </p>
      ) : (
        <div className={GRID}>
          {songs.map((s) => (
            <SongCard key={s.id} song={s} />
          ))}
        </div>
      )}
    </div>
  );
}
