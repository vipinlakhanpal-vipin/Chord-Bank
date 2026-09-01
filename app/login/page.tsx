"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else window.location.href = "/";
  };

  return (
    <div className="max-w-sm mx-auto card p-6 flex flex-col gap-4 mt-8">
      <h1 className="text-xl font-display font-bold text-center">Log in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-white/5"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-white/5"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl px-4 py-2 bg-magenta text-white font-semibold disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="text-sm text-center text-ink/60 dark:text-cream/60">
        No account? <a href="/signup" className="text-teal underline">Sign up</a>
      </p>
    </div>
  );
}
