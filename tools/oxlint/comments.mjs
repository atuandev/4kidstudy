#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const BASELINE_FILE = path.join(HERE, "comment-baseline.json");
const TARGETS = ["apps/api/src", "apps/api/test", "apps/web", "packages/contracts"];

const USAGE = `Usage: node tools/oxlint/comments.mjs <command>

  list [--out file.json]   Every comment, as JSON: { id, file, line, start, end, text }.
  baseline                 Shrink the baseline to the current counts. Fails if any file grew.
  baseline --init          Write the current counts as the baseline (first run only).
  delete <plan.json>       Delete the comments listed in plan.json (entries from \`list\`),
                           whole lines when the comment stands alone, JSX {/* */} included.`;

function inventory() {
  const lintCwd = path.join(ROOT, "apps/web");
  const result = spawnSync(
    "pnpm",
    [
      "exec",
      "oxlint",
      "-c",
      path.join(HERE, "comments-only.json"),
      "--format",
      "json",
      ...TARGETS.map((target) => path.join(ROOT, target)),
    ],
    {
      cwd: lintCwd,
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      env: { ...process.env, NO_COMMENTS_INVENTORY: "1" },
      stdio: ["ignore", "pipe", "inherit"],
    },
  );
  const output = result.stdout ?? "";
  if (!output.includes("{")) throw new Error(`oxlint produced no report (exit ${result.status}).`);
  const { diagnostics } = JSON.parse(output.slice(output.indexOf("{")));
  const sources = new Map();
  const comments = diagnostics
    .filter((d) => d.code === "no-comments(no-comments)")
    .map((d) => {
      const file = path.relative(ROOT, path.resolve(lintCwd, d.filename)).split(path.sep).join("/");
      const [start, end] = JSON.parse(d.message.slice("INVENTORY ".length));
      if (!sources.has(file)) sources.set(file, readFileSync(path.join(ROOT, file), "utf8"));
      const source = sources.get(file);
      const line = source.slice(0, start).split("\n").length;
      return { file, line, start, end, text: source.slice(start, end) };
    })
    .sort((a, b) => a.file.localeCompare(b.file) || a.start - b.start);
  return comments.map((comment, id) => ({ id, ...comment }));
}

function countByFile(comments) {
  const counts = {};
  for (const { file } of comments) counts[file] = (counts[file] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

function writeBaseline(files) {
  const total = Object.values(files).reduce((sum, n) => sum + n, 0);
  writeFileSync(BASELINE_FILE, `${JSON.stringify({ total, files }, null, 2)}\n`);
  return total;
}

function baseline(init) {
  const current = countByFile(inventory());
  if (init || !existsSync(BASELINE_FILE)) {
    console.log(`Baseline written: ${writeBaseline(current)} comments.`);
    return;
  }
  const previous = JSON.parse(readFileSync(BASELINE_FILE, "utf8")).files ?? {};
  const grown = Object.entries(current).filter(([file, n]) => n > (previous[file] ?? 0));
  if (grown.length > 0) {
    for (const [file, n] of grown) console.error(`${file}: ${n} > ${previous[file] ?? 0}`);
    console.error("The comment baseline only goes down. Remove the new comments.");
    process.exit(1);
  }
  const before = Object.values(previous).reduce((sum, n) => sum + n, 0);
  const after = writeBaseline(current);
  console.log(`Baseline: ${before} -> ${after} comments.`);
}

function lineBounds(source, start, end) {
  const lineStart = source.lastIndexOf("\n", start - 1) + 1;
  const newline = source.indexOf("\n", end);
  const lineEnd = newline === -1 ? source.length : newline + 1;
  return { lineStart, lineEnd };
}

function expandJsxContainer(source, start, end) {
  if (!source.startsWith("/*", start)) return { start, end };
  const before = source.slice(0, start).match(/\{[ \t]*$/);
  const after = source.slice(end).match(/^[ \t]*\}/);
  if (!before || !after) return { start, end };
  return { start: start - before[0].length, end: end + after[0].length };
}

function removalRange(source, comment) {
  const { start, end } = expandJsxContainer(source, comment.start, comment.end);
  const { lineStart, lineEnd } = lineBounds(source, start, end);
  const head = source.slice(lineStart, start);
  const tail = source.slice(end, lineEnd);
  if (!head.trim() && !tail.trim()) return [lineStart, lineEnd];
  if (!tail.trim()) return [start - (head.length - head.trimEnd().length), end];
  return [start, end + (tail.length - tail.trimStart().length)];
}

function deleteComments(planFile) {
  const plan = JSON.parse(readFileSync(planFile, "utf8"));
  const byFile = Map.groupBy(plan, (comment) => comment.file);
  for (const [file, comments] of byFile) {
    const absolute = path.join(ROOT, file);
    let source = readFileSync(absolute, "utf8");
    for (const comment of comments.toSorted((a, b) => b.start - a.start)) {
      if (source.slice(comment.start, comment.end) !== comment.text) {
        throw new Error(`${file}:${comment.line} changed since it was listed; run \`list\` again.`);
      }
      const [from, to] = removalRange(source, comment);
      source = source.slice(0, from) + source.slice(to);
    }
    writeFileSync(absolute, source);
  }
  console.log(`Deleted ${plan.length} comments in ${byFile.size} files.`);
}

const [command, ...args] = process.argv.slice(2);
if (command === "list") {
  const json = JSON.stringify(inventory(), null, 2);
  const out = args[args.indexOf("--out") + 1];
  if (args.includes("--out") && out) writeFileSync(out, `${json}\n`);
  else console.log(json);
} else if (command === "baseline") {
  baseline(args.includes("--init"));
} else if (command === "delete" && args[0]) {
  deleteComments(args[0]);
} else {
  console.log(USAGE);
  process.exit(command ? 1 : 0);
}
