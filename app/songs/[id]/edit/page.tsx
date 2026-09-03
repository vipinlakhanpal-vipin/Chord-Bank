"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import SongForm from "@/components/SongForm";
import { useAuthUser } from "@/lib/useAuthUser";
import { useSong } from "@/lib/useSongs";

export default function EditSongPage() {
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuthUser();
  const { song } = useSong(params.id);

  if (authLoading || song === undefined) return null;

  if (!user) {
    return (
      <div className="card p-6 max-w-md mx-auto text-center flex flex-col gap-3">
        <h1 className="text-lg font-display font-bold">Log in to edit this song</h1>
        <Link href="/login" className="self-center px-4 py-2 rounded-xl bg-teal text-white text-sm font-semibold">
          Log in
        </Link>
      </div>
    );
  }

  if (!song) {
    return <p className="text-sm text-ink/50 dark:text-cream/50">Song not found.</p>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      <div className="card p-4">
        <h1 className="text-xl font-display font-bold mb-1">Edit {song.title}</h1>
      </div>
      <SongForm existing={song} />
    </div>
  );
}
