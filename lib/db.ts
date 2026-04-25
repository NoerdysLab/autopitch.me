import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// One thin wrapper around Neon's HTTP driver. We use HTTP (not WebSockets)
// because every query in V1 is a single round-trip — no transactions, no
// long-lived connections — which is the cheap, fast path on Vercel.
//
// Usage:
//   import { getSql } from "@/lib/db";
//   const sql = getSql();
//   const rows = await sql`SELECT * FROM users WHERE handle = ${handle}`;
//
// Tagged-template parameters are sent as bind variables, so this is safe
// against SQL injection — never string-concatenate user input.

let cached: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and paste your Neon connection string.",
    );
  }
  cached = neon(url);
  return cached;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
