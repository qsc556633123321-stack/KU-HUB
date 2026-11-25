import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const checkOnly = process.argv.includes("--check");
const versionableUrl = /(["'])(\.{1,2}\/(?:[\w.-]+\/)*[\w.-]+\.(?:css|js|json|svg|avif|webp|png|jpe?g))(?:\?v=[0-9a-f]+)?\1/g;

async function listFiles(directory) {
  const entries = await readdir(new URL(directory + "/", root), { withFileTypes: true });
  const paths = await Promise.all(entries.map((entry) => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? listFiles(path) : path;
  }));
  return paths.flat();
}

function stampUrls(source, version) {
  return source.replace(versionableUrl, (_, quote, path) => {
    return `${quote}${path}${version ? `?v=${version}` : ""}${quote}`;
  });
}

const files = [
  "index.html", "project.html", "style.css", "script.js",
  ...await listFiles("js"),
  ...await listFiles("data"),
  ...await listFiles("assets"),
].sort();
const urlsInFile = /\.(?:html|js)$/;
const inputs = await Promise.all(files.map(async (file) => {
  const bytes = await readFile(new URL(file, root));
  const text = /\.(?:html|js|css|json|svg)$/.test(file)
    ? bytes.toString("utf8").replace(/^\uFEFF/, "").replaceAll("\r\n", "\n")
    : null;
  return { file, bytes, text };
}));

const hash = createHash("sha256");
for (const { file, bytes, text } of inputs) {
  const content = text === null ? bytes : urlsInFile.test(file) ? stampUrls(text, "") : text;
  hash.update(JSON.stringify([file, Buffer.byteLength(content)]));
  hash.update(content);
}
const version = hash.digest("hex").slice(0, 16);
const stale = [];
for (const { file, text } of inputs) {
  if (!urlsInFile.test(file)) continue;
  const updated = stampUrls(text, version);
  if (updated === text) continue;
  stale.push(file);
  if (!checkOnly) await writeFile(new URL(file, root), updated);
}

if (checkOnly && stale.length) {
  console.error(`Asset versions need regeneration: ${stale.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(`KU HUB asset version: ${version}`);
}
