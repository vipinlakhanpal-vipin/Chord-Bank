import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Chord Bank — Bollywood Chords for the 6 Chords You Know",
  description:
    "Hindi Bollywood song chords limited to A, E, Em, G, C, D — transpose within that combo, practice, and record yourself.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
