// Runs automatically before every build (see package.json's "prebuild"
// script) so public/version.json always matches lib/version.ts's
// APP_VERSION — one source of truth, no separate manual step to forget.
// public/version.json is what the running app polls (see
// components/ServiceWorkerRegister.tsx) to notice a new deploy on its own,
// without waiting for a manual refresh.
const fs = require("fs");
const path = require("path");

const versionFile = path.join(__dirname, "..", "lib", "version.ts");
const source = fs.readFileSync(versionFile, "utf8");
const match = source.match(/APP_VERSION\s*=\s*"([^"]+)"/);
if (!match) {
  console.error("generate-version-json: couldn't find APP_VERSION in lib/version.ts");
  process.exit(1);
}

const version = match[1];
const outFile = path.join(__dirname, "..", "public", "version.json");
fs.writeFileSync(outFile, JSON.stringify({ version }) + "\n");
console.log(`generate-version-json: wrote public/version.json (${version})`);
