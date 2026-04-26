import { redirect } from "next/navigation";
import Link from "next/link";
import CopyLink from "./CopyLink";
import { getStatsForHandle } from "@/lib/clicks";
import { getSession } from "@/lib/session";
import { getUserByEmail } from "@/lib/users";

export const metadata = { title: "Dashboard" };

const PLATFORM_LABEL = {
  claude: "Claude",
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  gemini: "Gemini",
} as const;

export default async function Dashboard() {
  const session = await getSession();
  if (!session.email) redirect("/signup");

  const user = await getUserByEmail(session.email);
  if (!user || user.deleted_at) redirect("/signup");

  const stats = await getStatsForHandle(user.handle);
  const max = Math.max(1, ...stats.byPlatform.map((p) => p.count));
  const sparkMax = Math.max(1, ...stats.daily.map((d) => d.count));

  return (
    <div className="page">
      <header className="site-header">
        <div className="container header-row">
          <Link href="/" className="wordmark">autopitch.me</Link>
          <form action="/api/auth/logout" method="post" className="signout-form">
            <button type="submit" className="nav-link" formAction="/api/auth/logout">
              sign out
            </button>
          </form>
        </div>
      </header>

      <main className="container dash">
        <section className="dash-hero">
          <div className="dash-hero-label">Your page</div>
          <div className="dash-link-row">
            <span className="dash-link">autopitch.me/{user.handle}</span>
            <CopyLink url={`https://autopitch.me/${user.handle}`} />
            <Link href={`/${user.handle}`} className="nav-link">view</Link>
            <Link href={`/${user.handle}/edit`} className="nav-link">edit</Link>
          </div>
        </section>

        <section className="dash-section">
          <h2 className="dash-h2">Clicks</h2>
          <div className="stat-grid">
            <Stat label="total"        value={stats.total} />
            <Stat label="last 7 days"  value={stats.last7} />
            <Stat label="last 30 days" value={stats.last30} />
          </div>
        </section>

        <section className="dash-section">
          <h2 className="dash-h2">By AI platform</h2>
          {stats.byPlatform.length === 0 ? (
            <p className="dash-empty">No clicks yet — share your page to get the first one.</p>
          ) : (
            <ul className="bars">
              {stats.byPlatform.map((p) => (
                <li key={p.ai_platform} className="bar-row">
                  <span className="bar-label">{PLATFORM_LABEL[p.ai_platform]}</span>
                  <span className="bar-track">
                    <span
                      className="bar-fill"
                      style={{ width: `${(p.count / max) * 100}%` }}
                    />
                  </span>
                  <span className="bar-value">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dash-section">
          <h2 className="dash-h2">Last 30 days</h2>
          {stats.last30 === 0 ? (
            <p className="dash-empty">No activity in the last 30 days.</p>
          ) : (
            <Sparkline daily={stats.daily} max={sparkMax} />
          )}
        </section>

        <section className="dash-section dash-danger">
          <p className="dash-empty">
            Need to take your page down? Use the link in your welcome email
            (subject: <em>Your autopitch.me page is live</em>).
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">autopitch.me</div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <div className="stat-value">{value.toLocaleString()}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Sparkline({
  daily,
  max,
}: {
  daily: { day: string; count: number }[];
  max: number;
}) {
  const W = 600;
  const H = 80;
  const stepX = daily.length > 1 ? W / (daily.length - 1) : W;
  const points = daily
    .map((d, i) => {
      const x = i * stepX;
      const y = H - (d.count / max) * (H - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="sparkline-wrap">
      <svg
        className="sparkline"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-label="Clicks per day, last 30 days"
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
      <div className="sparkline-axis">
        <span>{daily[0]?.day.slice(5)}</span>
        <span>{daily[daily.length - 1]?.day.slice(5)}</span>
      </div>
    </div>
  );
}
