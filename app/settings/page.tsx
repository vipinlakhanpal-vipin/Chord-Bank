"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/lib/supabaseClient";

export default function SettingsPage() {
  const { theme, toggle } = useTheme();
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setDisplayName((data.user?.user_metadata?.display_name as string) ?? "");
    });
  }, []);

  const saveProfile = async () => {
    await supabase.auth.updateUser({ data: { display_name: displayName } });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-4">
        <h1 className="text-xl font-display font-bold mb-1">Settings</h1>
        <p className="text-sm text-ink/60 dark:text-cream/60">Theme, account, and app preferences.</p>
      </div>

      <div className="card p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold">Appearance</p>
          <p className="text-sm text-ink/60 dark:text-cream/60">Light or dark theme</p>
        </div>
        <button onClick={toggle} className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 text-sm font-medium">
          Switch to {theme === "light" ? "dark" : "light"}
        </button>
      </div>

      <div className="card p-4 flex flex-col gap-3">
        <p className="font-semibold">Account</p>
        {email ? (
          <>
            <p className="text-sm text-ink/60 dark:text-cream/60">Signed in as {email}</p>
            <div>
              <label className="text-sm block mb-1">Display name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-white/5"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={saveProfile} className="px-4 py-2 rounded-xl bg-teal text-white text-sm font-medium">
                Save
              </button>
              <button onClick={signOut} className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 text-sm font-medium">
                Sign out
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-ink/60 dark:text-cream/60">
            You&apos;re not signed in. <a href="/login" className="text-teal underline">Log in</a> or{" "}
            <a href="/signup" className="text-teal underline">create an account</a>.
          </p>
        )}
      </div>

      <div className="card p-4">
        <p className="font-semibold mb-1">Your chords</p>
        <p className="text-sm text-ink/60 dark:text-cream/60">
          A, E, Em, G, C, D — every song and transpose suggestion in this app is filtered to this set.
        </p>
      </div>
    </div>
  );
}
