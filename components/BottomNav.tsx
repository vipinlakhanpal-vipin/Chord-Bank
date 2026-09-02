"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AriaChat from "./AriaChat";
import UpdatesButton from "./UpdatesButton";
import { useUpdateAvailable } from "@/lib/useUpdateAvailable";

export default function BottomNav() {
  const pathname = usePathname();
  const { available: updatePending, acknowledge } = useUpdateAvailable();

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-ink/95 backdrop-blur border-t border-black/5 dark:border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-6 items-end px-0.5 pt-1.5 pb-1.5">
        <NavItem href="/" label="Home" active={isActive("/")}>
          <HomeIcon />
        </NavItem>

        <div className="flex flex-col items-center gap-1 py-1">
          <AriaChat />
          <span className="text-[9px]" style={{ color: "#7C3AED" }}>Aria</span>
        </div>

        <UpdatesButton showLabel />

        <NavItem href="/favourites" label="Favourites" active={isActive("/favourites")}>
          <FavHeartIcon active={isActive("/favourites")} />
        </NavItem>

        <NavItem href="/settings" label="Settings" active={isActive("/settings")}>
          <SettingsIcon />
        </NavItem>

        <button
          onClick={() => {
            acknowledge();
            window.location.reload();
          }}
          className="relative flex flex-col items-center gap-1 py-1 text-ink/50 dark:text-cream/50 transition-transform duration-100 ease-out active:scale-90"
        >
          <span className="relative inline-flex">
            <RefreshIcon />
            {updatePending && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white dark:border-ink" />
            )}
          </span>
          <span className="text-[10px]">Refresh</span>
        </button>
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={`flex flex-col items-center gap-1 py-1 transition-transform duration-100 ease-out active:scale-90 ${
        active ? "text-teal" : "text-ink/50 dark:text-cream/50"
      }`}
    >
      {children}
      <span className="text-[9px]">{label}</span>
    </Link>
  );
}

function FavHeartIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M12 21s-6.7-4.35-9.3-8.1C1 10.2 1.6 6.6 4.6 5.1 7 3.9 9.6 4.7 12 7.3c2.4-2.6 5-3.4 7.4-2.2 3 1.5 3.6 5.1 1.9 7.8C18.7 16.65 12 21 12 21Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" strokeLinecap="round" />
      <path d="M21 4v6h-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
