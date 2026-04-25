#!/usr/bin/env node
// One-shot helper that runs every .sql file in migrations/ in numeric order.
// Splits each file on `;` followed by a newline, ignoring comments and empty
// statements. Uses the Neon HTTP driver so it works from environments that
// block raw Postgres TCP.
//
// Usage:  node --env-file=.env.local scripts/migrate.mjs

import { neon } from "@neondatabase/serverless";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Did you forget --env-file=.env.local?");
  process.exit(1);
}

const sql = neon(url);
const dir = "migrations";
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  const path = join(dir, file);
  const text = readFileSync(path, "utf-8");

  // Strip line comments, then split on `;` at end-of-statement. We respect
  // dollar-quoted blocks (e.g. $md$...$md$) so multi-line strings stay intact.
  const statements = splitSql(stripComments(text));

  console.log(`▸ ${file}  (${statements.length} statement${statements.length === 1 ? "" : "s"})`);
  for (const stmt of statements) {
    try {
      await sql.query(stmt);
    } catch (err) {
      console.error(`  ✗ failed: ${err.message}`);
      console.error(`  statement: ${stmt.slice(0, 120)}${stmt.length > 120 ? "..." : ""}`);
      process.exit(1);
    }
  }
  console.log(`  ✓ done`);
}

console.log("\nAll migrations applied.");

function stripComments(s) {
  return s
    .split("\n")
    .map((line) => {
      const i = line.indexOf("--");
      return i === -1 ? line : line.slice(0, i);
    })
    .join("\n");
}

function splitSql(s) {
  const out = [];
  let buf = "";
  let dollarTag = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (dollarTag) {
      buf += c;
      if (c === "$" && s.startsWith(dollarTag, i)) {
        buf += s.slice(i + 1, i + dollarTag.length);
        i += dollarTag.length - 1;
        dollarTag = null;
      }
      continue;
    }
    if (c === "$") {
      const m = s.slice(i).match(/^\$([a-zA-Z_]*)\$/);
      if (m) {
        dollarTag = `$${m[1]}$`;
        buf += dollarTag;
        i += dollarTag.length - 1;
        continue;
      }
    }
    if (c === ";") {
      const trimmed = buf.trim();
      if (trimmed) out.push(trimmed);
      buf = "";
      continue;
    }
    buf += c;
  }
  const tail = buf.trim();
  if (tail) out.push(tail);
  return out;
}
