"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import Logo from "./Logo";
import UpdatesButton from "./UpdatesButton";
import { APP_VERSION, formatVersion } from "@/lib/version";
import { useUpdateAvailable } from "@/lib/useUpdateAvailable";

const LINKS = [
  { href: "/record", label: "Record" },
  { href: "/repositories", label: "Repositories" },
  { href: "/favourites", label: "Favourite" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { available: updatePending, acknowledge } = useUpdateAvailable();

  return (
    <nav className="fixed top-0 inset-x-0 z-20 backdrop-blur bg-cream/90 dark:bg-ink/90 border-b border-black/5 dark:border-white/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex flex-col leading-tight min-w-0">
          <span className="flex items-center gap-2 min-w-0">
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <Logo size={28} />
              <span className="font-display font-extrabold text-base sm:text-lg text-magenta dark:text-saffron truncate">
                Chord Bank
              </span>
            </Link>
            <span
              title={`Version ${APP_VERSION}`}
              className="inline-block text-[11px] font-extrabold px-1.5 py-0.5 rounded-full bg-teal/15 text-teal shrink-0"
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
              className="hidden sm:flex relative w-6 h-6 rounded-full items-center justify-center text-ink/40 dark:text-cream/40 hover:text-teal hover:bg-teal/10 shrink-0"
            >
              <RefreshIcon size={13} />
              {updatePending && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border-2 border-cream dark:border-ink" />
              )}
            </button>
            <span className="hidden sm:inline-flex shrink-0">
              <UpdatesButton size={15} />
            </span>
          </span>
          <span className="hidden sm:block text-[10px] pl-9 text-black/20 dark:text-white/20">Created by Vipin</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 sm:gap-4 shrink-0">
          <Link
            href="/"
            aria-label="Home"
            title="Home"
            className={`flex w-8 h-8 rounded-full items-center justify-center ${
              pathname === "/" ? "bg-teal text-white" : "text-ink/60 dark:text-cream/60"
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
              className={`text-sm px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                pathname === l.href
                  ? "bg-teal text-white font-semibold"
                  : "text-ink/70 dark:text-cream/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="ml-2 w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 shrink-0"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
        <div className="sm:hidden flex items-center gap-1 shrink-0">
          <Link
            href="/record"
            aria-label="Record"
            title="Record"
            className={`flex items-center gap-0.5 px-1.5 py-1 rounded-full text-[10px] font-bold border ${
              pathname === "/record"
                ? "bg-teal text-white border-teal"
                : "border-black/10 dark:border-white/20 text-ink/70 dark:text-cream/70"
            }`}
          >
            <MicIcon />
            Rec
          </Link>
          <Link
            href="/repositories"
            aria-label="Repositories"
            title="Repositories"
            className={`flex items-center gap-0.5 px-1.5 py-1 rounded-full text-[10px] font-bold border ${
              pathname === "/repositories"
                ? "bg-teal text-white border-teal"
                : "border-black/10 dark:border-white/20 text-ink/70 dark:text-cream/70"
            }`}
          >
            <StackIcon />
            Repo
          </Link>
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 shrink-0 text-xs"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </nav>
  );
}

function MicIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" strokeLinecap="round" />
      <path d="M12 19v3" strokeLinecap="round" />
    </svg>
  );
}

function StackIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m3 13 9 5 9-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
