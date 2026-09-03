"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthUser } from "@/lib/useAuthUser";
import { useRepositories } from "@/lib/useRepositories";
import { slugify } from "@/lib/songId";
import { ParsedSongRow, buildTemplateWorkbook, parseSongsWorkbook } from "@/lib/xlsxImport";
import { parseSongsFromText } from "@/lib/textSongParser";
import { extractDocxText, extractPdfText, buildWordTemplate } from "@/lib/fileTextExtract";

type RowStatus = "pending" | "importing" | "done" | "failed";
type FileKind = "xlsx" | "docx" | "pdf";

function fileKindFor(name: string): FileKind | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return "xlsx";
  if (lower.endsWith(".docx")) return "docx";
  if (lower.endsWith(".pdf")) return "pdf";
  return null;
}

interface ImportRow extends ParsedSongRow {
  include: boolean;
  status: RowStatus;
  resultMessage?: string;
}

export default function ImportSongsPage() {
  const { user, loading: authLoading } = useAuthUser();
  const { createRepository } = useRepositories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{ ok: number; failed: number } | null>(null);

  const [templateBusy, setTemplateBusy] = useState<"xlsx" | "word" | null>(null);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const bytes = buildTemplateWorkbook();
    // TS's DOM lib wants a plain ArrayBuffer-backed BlobPart; xlsx's Uint8Array
    // is typed against the wider ArrayBufferLike, so it needs an explicit cast.
    const blob = new Blob([bytes as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    downloadBlob(blob, "chord-bank-song-import-template.xlsx");
  };

  const handleDownloadWordTemplate = async () => {
    setTemplateBusy("word");
    try {
      const blob = await buildWordTemplate();
      downloadBlob(blob, "chord-bank-song-import-template.docx");
    } finally {
      setTemplateBusy(null);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const kind = fileKindFor(file.name);
    setFileName(file.name);
    setParseError(null);
    setImportSummary(null);
    if (!kind) {
      setRows([]);
      setParseError("That file type isn't supported — pick a .xlsx, .docx, or .pdf file.");
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      let parsed;
      if (kind === "xlsx") {
        parsed = parseSongsWorkbook(buffer);
      } else if (kind === "docx") {
        parsed = parseSongsFromText(await extractDocxText(buffer));
      } else {
        parsed = parseSongsFromText(await extractPdfText(buffer));
      }
      if (parsed.length === 0) {
        setRows([]);
        setParseError(
          kind === "xlsx"
            ? "Couldn't find any song rows in that file — check it matches the template's columns."
            : "Couldn't find any songs in that file — check each song has a \"Title:\" line and, if there's more than one, that they're separated by a \"----- NEW SONG -----\" line, same as the template."
        );
        return;
      }
      setRows(
        parsed.map((r) => ({
          ...r,
          include: r.errors.length === 0,
          status: "pending" as RowStatus,
        }))
      );
    } catch (err) {
      setRows([]);
      setParseError(err instanceof Error ? `Couldn't read that file: ${err.message}` : "Couldn't read that file.");
    }
  };

  const toggleRow = (rowNumber: number) => {
    setRows((prev) => prev.map((r) => (r.rowNumber === rowNumber ? { ...r, include: !r.include } : r)));
  };

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const includedCount = rows.filter((r) => r.errors.length === 0 && r.include).length;

  const handleImport = async () => {
    setImporting(true);
    setImportSummary(null);
    const usedSlugs = new Set<string>();
    let ok = 0;
    let failed = 0;
    const repositoriesCreated = new Set<string>();

    for (const row of rows) {
      if (row.errors.length > 0 || !row.include) continue;
      setRows((prev) => prev.map((r) => (r.rowNumber === row.rowNumber ? { ...r, status: "importing" } : r)));

      try {
        const trimmedRepo = row.repository?.trim() || "Vipin";
        if (trimmedRepo && !repositoriesCreated.has(trimmedRepo)) {
          await createRepository(trimmedRepo);
          repositoriesCreated.add(trimmedRepo);
        }

        let id = slugify(row.title);
        if (!id) id = `song-${Date.now()}`;
        while (usedSlugs.has(id)) {
          id = `${id}-${Math.random().toString(36).slice(2, 6)}`;
        }
        const { data: clash } = await supabase.from("songs").select("id").eq("id", id).maybeSingle();
        if (clash) id = `${id}-${Date.now().toString().slice(-5)}`;
        usedSlugs.add(id);

        const { error } = await supabase.from("songs").insert({
          id,
          title: row.title,
          singers: row.singers,
          movie: row.movie,
          year: row.year,
          language: "Hindi",
          youtube_id: row.youtubeId,
          chart: row.chart,
          genres: row.genres,
          added_via: "manual",
          repository: trimmedRepo,
        });

        if (error) {
          failed++;
          setRows((prev) =>
            prev.map((r) => (r.rowNumber === row.rowNumber ? { ...r, status: "failed", resultMessage: error.message } : r))
          );
        } else {
          ok++;
          setRows((prev) => (prev.map((r) => (r.rowNumber === row.rowNumber ? { ...r, status: "done" } : r))));
        }
      } catch (err) {
        failed++;
        const message = err instanceof Error ? err.message : "Unknown error";
        setRows((prev) =>
          prev.map((r) => (r.rowNumber === row.rowNumber ? { ...r, status: "failed", resultMessage: message } : r))
        );
      }
    }

    setImporting(false);
    setImportSummary({ ok, failed });
  };

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="card p-4">
        <p className="text-sm text-ink/60 dark:text-cream/60">
          <Link href="/login" className="text-teal underline font-semibold">
            Log in
          </Link>{" "}
          to import songs.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <h1 className="text-xl font-display font-bold mb-1">Import songs from Excel, Word, or PDF</h1>
        <p className="text-sm text-ink/60 dark:text-cream/60">
          Excel: one row per song — Title, Singers, Movie, Year, Genres, YouTube, Repository, Chart. Word/PDF: one{" "}
          <code className="text-xs">Label: value</code> per line (Title, Singers, Movie, Year, Genres, YouTube,
          Repository, then a <code className="text-xs">Chart:</code> line followed by the chart itself), with multiple
          songs separated by a <code className="text-xs">----- NEW SONG -----</code> line — download the matching
          template below to see the exact layout. Chart text can be pasted straight from Ultimate Guitar (chords on
          their own line above the lyrics) or already in this app&apos;s inline <code className="text-xs">[Chord]lyric</code>{" "}
          format — both auto-convert, same as the single-song Add form. This never writes lyrics on its own — it only
          imports chart text you&apos;ve already sourced yourself, straight from your file.
        </p>
      </div>

      <div className="card p-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-4 py-2 rounded-xl text-white font-semibold bg-gradient-to-br from-violet-500 to-purple-700 shadow-md"
          >
            Download Excel template (.xlsx)
          </button>
          <button
            type="button"
            onClick={handleDownloadWordTemplate}
            disabled={templateBusy === "word"}
            className="px-4 py-2 rounded-xl text-white font-semibold bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-md disabled:cursor-not-allowed"
          >
            {templateBusy === "word" ? "Preparing…" : "Download Word/PDF template (.docx)"}
          </button>
        </div>
        <p className="text-xs text-ink/50 dark:text-cream/50 -mt-1">
          The Word template can be uploaded as-is, or exported to PDF from Word/Google Docs first (File → Save as /
          Export → PDF) if a PDF is what you already have.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl text-white font-semibold bg-gradient-to-br from-cyan-500 to-sky-700 shadow-md"
          >
            Choose .xlsx, .docx, or .pdf file
          </button>
          {fileName && <span className="text-sm text-ink/60 dark:text-cream/60">{fileName}</span>}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.docx,.pdf"
            onChange={handleFile}
            className="hidden"
          />
        </div>
        {parseError && <p className="text-sm text-red-500">{parseError}</p>}
      </div>

      {rows.length > 0 && (
        <div className="card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-semibold text-sm">
              {rows.length} row{rows.length === 1 ? "" : "s"} found — {validCount} ready to import
              {validCount !== rows.length ? `, ${rows.length - validCount} with problems` : ""}
            </h2>
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || includedCount === 0}
              className="px-4 py-2 rounded-xl text-white font-semibold bg-gradient-to-br from-emerald-500 to-green-700 shadow-md disabled:cursor-not-allowed"
            >
              {importing ? "Importing..." : `Import ${includedCount} song${includedCount === 1 ? "" : "s"}`}
            </button>
          </div>

          {importSummary && (
            <p className="text-sm px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10">
              Imported {importSummary.ok} song{importSummary.ok === 1 ? "" : "s"}
              {importSummary.failed > 0 ? `, ${importSummary.failed} failed (see below)` : ""}.{" "}
              <Link href="/" className="text-teal underline font-medium">
                Go to Home
              </Link>
            </p>
          )}

          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-xs text-ink/50 dark:text-cream/50 border-b border-black/10 dark:border-white/10">
                  <th className="py-1.5 px-4 w-8"></th>
                  <th className="py-1.5 px-2">Row</th>
                  <th className="py-1.5 px-2">Title</th>
                  <th className="py-1.5 px-2">Singers</th>
                  <th className="py-1.5 px-2">Year</th>
                  <th className="py-1.5 px-2">Repository</th>
                  <th className="py-1.5 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.rowNumber} className="border-b border-black/5 dark:border-white/5 align-top">
                    <td className="py-1.5 px-4">
                      <input
                        type="checkbox"
                        checked={r.include}
                        disabled={r.errors.length > 0}
                        onChange={() => toggleRow(r.rowNumber)}
                      />
                    </td>
                    <td className="py-1.5 px-2 text-ink/50 dark:text-cream/50">{r.rowNumber}</td>
                    <td className="py-1.5 px-2 font-medium">{r.title || <span className="text-ink/40">—</span>}</td>
                    <td className="py-1.5 px-2">{r.singers.join(", ") || <span className="text-ink/40">—</span>}</td>
                    <td className="py-1.5 px-2">{r.year ?? <span className="text-ink/40">—</span>}</td>
                    <td className="py-1.5 px-2">{r.repository || "Vipin"}</td>
                    <td className="py-1.5 px-2">
                      {r.errors.length > 0 ? (
                        <span className="text-red-500 text-xs">{r.errors.join(" ")}</span>
                      ) : r.status === "importing" ? (
                        <span className="text-xs text-ink/50 dark:text-cream/50">Importing…</span>
                      ) : r.status === "done" ? (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white font-medium">
                          Imported
                        </span>
                      ) : r.status === "failed" ? (
                        <span className="text-red-500 text-xs">{r.resultMessage || "Failed"}</span>
                      ) : r.unknownGenres.length > 0 ? (
                        <span className="text-xs text-amber-500">Unknown genre(s): {r.unknownGenres.join(", ")}</span>
                      ) : (
                        <span className="text-xs text-ink/40">Ready</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
