"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-sm mx-auto card p-6 mt-8 text-center">
        <p className="font-semibold mb-2">Check your email</p>
        <p className="text-sm text-ink/60 dark:text-cream/60">
          Confirm your address, then <a href="/login" className="text-teal underline">log in</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto card p-6 flex flex-col gap-4 mt-8">
      <h1 className="text-xl font-display font-bold text-center">Create your account</h1>
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
          minLength={6}
          placeholder="Password (min 6 characters)"
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
          {loading ? "Creating..." : "Sign up"}
        </button>
      </form>
      <p className="text-sm text-center text-ink/60 dark:text-cream/60">
        Already have an account? <a href="/login" className="text-teal underline">Log in</a>
      </p>
    </div>
  );
}
