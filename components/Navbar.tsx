"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import Logo from "./Logo";
import { APP_VERSION, formatVersion } from "@/lib/version";

const LINKS = [
  { href: "/", label: "Songs" },
  { href: "/record", label: "Record" },
  { href: "/repositories", label: "Repositories" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <nav className="sticky top-0 z-10 backdrop-blur bg-cream/80 dark:bg-ink/80 border-b border-black/5 dark:border-white/10">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={30} />
          <span className="font-display font-extrabold text-lg text-magenta dark:text-saffron">
            Chord Bank
          </span>
          <span
            title={`Version ${APP_VERSION}`}
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-ink/50 dark:text-cream/50 translate-y-[1px]"
          >
            {formatVersion(APP_VERSION)}
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-4">
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
