"use client";

import Link from "next/link";
import SongForm from "@/components/SongForm";
import { useAuthUser } from "@/lib/useAuthUser";

export default function NewSongPage() {
  const { user, loading } = useAuthUser();

  if (loading) return null;

  if (!user) {
    return (
      <div className="card p-6 max-w-md mx-auto text-center flex flex-col gap-3">
        <h1 className="text-lg font-display font-bold">Log in to add a song</h1>
        <p className="text-sm text-ink/60 dark:text-cream/60">
          Adding to your chord library is limited to your own account.
        </p>
        <Link href="/login" className="self-center px-4 py-2 rounded-xl bg-teal text-white text-sm font-semibold">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      <div className="card p-4">
        <h1 className="text-xl font-display font-bold mb-1">Add a song</h1>
        <p className="text-sm text-ink/60 dark:text-cream/60">
          Paste in the chart from wherever you sourced it — this just saves it to your library and runs it through
          the transpose engine.
        </p>
      </div>
      <SongForm />
    </div>
  );
}
