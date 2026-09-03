// Turns an uploaded .docx or .pdf file into plain text, for the PDF/Word
// bulk importer (app/songs/import) to run through lib/textSongParser.ts —
// the same field-label parser either format lands in.
//
// Both libraries only work in a browser (they touch things like DOMMatrix/
// Path2D or the DOM that don't exist during Next.js's server build), so
// every call here uses a dynamic import() instead of a top-level import —
// that keeps this module safe to reference from a "use client" page
// without breaking the server-side build, and keeps these fairly large
// libraries out of every other page's bundle since they only ever load
// once someone actually picks a .docx or .pdf file.

export async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  // Import mammoth's regular Node entry point, not its self-contained
  // mammoth.browser.js bundle. That bundle is meant to be dropped in with a
  // plain <script> tag (no further bundling) — feeding it through a SECOND
  // bundler (webpack) as well touched off nested bluebird-promise scheduling
  // that never actually flushed, so extractRawText's promise just hung
  // forever with no error. Importing "mammoth" instead lets webpack apply
  // mammoth's package.json "browser" field itself (swapping in its
  // browser-safe unzip/file modules) as part of one single bundling pass —
  // no second bundler involved — which resolves normally.
  type MammothLike = { extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> };
  const mod: unknown = await import("mammoth");
  const asMammoth = (v: unknown): MammothLike | null =>
    v && typeof (v as MammothLike).extractRawText === "function" ? (v as MammothLike) : null;
  const mammoth = asMammoth(mod) ?? asMammoth((mod as { default?: unknown }).default);
  if (!mammoth) throw new Error("Could not load the Word document reader.");
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  // mammoth's raw-text mode always inserts a blank line between paragraphs
  // (that's how it marks a paragraph break, not something a real empty
  // paragraph would look any different from) — since this importer's
  // template puts every field and every chart line on its own paragraph,
  // left as-is that would double-space the whole chart. Collapsing every
  // run of blank lines down to one turns "one paragraph per line" back
  // into "one line per line".
  return result.value.replace(/\n{2,}/g, "\n");
}

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
  // Bundled locally (public/pdf.worker.min.js, copied from this exact
  // pdfjs-dist version at build time) rather than pointed at a CDN, so
  // extraction doesn't depend on a third-party host being reachable.
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const lines: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    // pdf.js hands back text in disconnected fragments, not lines — group
    // fragments that share a vertical position (their transform's y value)
    // back into a single line, in the order they were returned, so labeled
    // fields like "Title: ..." survive as one line instead of scattering.
    let currentY: number | null = null;
    let currentLine: string[] = [];
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const y = Math.round(item.transform[5]);
      if (currentY !== null && y !== currentY && currentLine.length > 0) {
        lines.push(currentLine.join(" "));
        currentLine = [];
      }
      currentLine.push(item.str);
      currentY = y;
    }
    if (currentLine.length > 0) lines.push(currentLine.join(" "));
    lines.push(""); // keep pages from running into each other
  }

  return lines.join("\n");
}

/** Builds the downloadable .docx template shared by the PDF and Word importers (a PDF is easiest made by exporting this from Word/Google Docs). */
export async function buildWordTemplate(): Promise<Blob> {
  const { Document, Packer, Paragraph } = await import("docx");
  const { TEXT_TEMPLATE } = await import("./textSongParser");

  const doc = new Document({
    sections: [
      {
        children: TEXT_TEMPLATE.split("\n").map((line) => new Paragraph(line)),
      },
    ],
  });
  return Packer.toBlob(doc);
}
