import { getSql } from "./db";

// Analytics queries for the dashboard. Kept dumb on purpose — chart math
// (normalization, bar widths) lives in the component, not here.

export type PlatformCount = {
  ai_platform: "claude" | "chatgpt" | "perplexity" | "gemini";
  count: number;
};

export type DailyCount = { day: string; count: number };

export type Stats = {
  total: number;
  last7: number;
  last30: number;
  byPlatform: PlatformCount[];
  daily: DailyCount[];
};

export async function getStatsForHandle(handle: string): Promise<Stats> {
  const sql = getSql();

  const [totals, byPlatform, daily] = await Promise.all([
    sql`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE created_at > now() - interval '7 days')::int  AS last7,
        count(*) FILTER (WHERE created_at > now() - interval '30 days')::int AS last30
      FROM clicks
      WHERE handle = ${handle}
    `,
    sql`
      SELECT ai_platform, count(*)::int AS count
      FROM clicks
      WHERE handle = ${handle}
      GROUP BY ai_platform
      ORDER BY count DESC
    `,
    sql`
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
             count(*)::int AS count
      FROM clicks
      WHERE handle = ${handle}
        AND created_at > now() - interval '30 days'
      GROUP BY day
      ORDER BY day ASC
    `,
  ]);

  const t = (totals as Array<{ total: number; last7: number; last30: number }>)[0];
  return {
    total: t?.total ?? 0,
    last7: t?.last7 ?? 0,
    last30: t?.last30 ?? 0,
    byPlatform: byPlatform as PlatformCount[],
    daily: fillDailyGaps(daily as DailyCount[], 30),
  };
}

// Postgres only emits days that had clicks. Fill in zeros so the sparkline
// has an even spacing across the whole 30-day window.
function fillDailyGaps(rows: DailyCount[], days: number): DailyCount[] {
  const map = new Map(rows.map((r) => [r.day, r.count]));
  const out: DailyCount[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const day = d.toISOString().slice(0, 10);
    out.push({ day, count: map.get(day) ?? 0 });
  }
  return out;
}
