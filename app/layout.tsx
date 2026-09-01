import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Chord Bank — Bollywood Chords for the 6 Chords You Know",
  description:
    "Hindi Bollywood song chords limited to A, E, Em, G, C, D — transpose within that combo, practice, and record yourself.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Chord Bank",
  },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0EA5A0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ServiceWorkerRegister />
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-6 pb-24 sm:pb-6">{children}</main>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
