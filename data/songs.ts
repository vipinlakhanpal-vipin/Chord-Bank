import { Song } from "@/lib/types";

// Nothing lives here anymore — your song library is stored in Supabase, not
// in this codebase. Add songs yourself through the Add Song screen (Home ->
// "+ Add Song"), pasting in whatever chart text you've sourced; it's saved to
// your own `songs` table and read back by lib/useSongs.ts. This file is kept
// only so the Song type import path still resolves for anything that expects
// it — it's otherwise unused.
export const SONGS: Song[] = [];
