"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import Logo from "./Logo";
import UpdatesButton from "./UpdatesButton";
import { APP_VERSION, formatVersion } from "@/lib/version";
import { useUpdateAvailable } from "@/lib/useUpdateAvailable";

const LINKS = [
  { href: "/", label: "Songs" },
  { href: "/record", label: "Record" },
  { href: "/repositories", label: "Repositories" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { available: updatePending, acknowledge } = useUpdateAvailable();

  return (
    <nav className="sticky top-0 z-10 backdrop-blur bg-cream/80 dark:bg-ink/80 border-b border-black/5 dark:border-white/10">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex flex-col leading-tight">
          <span className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Logo size={30} />
              <span className="font-display font-extrabold text-lg text-magenta dark:text-saffron">
                Chord Bank
              </span>
            </Link>
            <span
              title={`Version ${APP_VERSION}`}
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-ink/50 dark:text-cream/50"
            >
              {formatVersion(APP_VERSION)}
            </span>
            <button
              onClick={() => {
                acknowledge();
                window.location.reload();
              }}
              aria-label="Refresh app"
              title={updatePending ? "New version available — click to refresh" : "Refresh"}
              className="relative w-6 h-6 rounded-full flex items-center justify-center text-ink/40 dark:text-cream/40 hover:text-teal hover:bg-teal/10"
            >
              <RefreshIcon size={13} />
              {updatePending && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border-2 border-cream dark:border-ink" />
              )}
            </button>
            <UpdatesButton size={15} />
          </span>
          <span className="text-[10px] pl-9 text-black/20 dark:text-white/20">Created by Vipin</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-4">
          <Link
            href="/"
            aria-label="Home"
            title="Home"
            className={`hidden sm:flex w-8 h-8 rounded-full items-center justify-center ${
              pathname === "/" ? "bg-teal/10 text-teal" : "text-ink/60 dark:text-cream/60 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm px-2 py-1 rounded-lg ${
                pathname === l.href
                  ? "bg-teal/10 text-teal font-semibold"
                  : "text-ink/70 dark:text-cream/70 hover:text-ink dark:hover:text-cream"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="ml-2 w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </nav>
  );
}

export function RefreshIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" strokeLinecap="round" />
      <path d="M21 4v6h-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
