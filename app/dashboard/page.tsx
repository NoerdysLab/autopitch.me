import { redirect } from "next/navigation";
import Link from "next/link";
import CopyLink from "./CopyLink";
import DeleteButton from "./DeleteButton";
import OwnerHeader from "@/components/OwnerHeader";
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
      <OwnerHeader handle={user.handle} />

      <main className="container dash">
        <section className="dash-hero">
          <div className="dash-hero-label">Your page</div>
          <div className="dash-link-row">
            <span className="dash-link">warmpitch.me/{user.handle}</span>
            <CopyLink url={`https://warmpitch.me/${user.handle}`} />
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

        <section className="dash-section">
          <div className="danger-zone">
            <h3>Danger zone</h3>
            <p>
              Delete your page permanently.{" "}
              <strong>warmpitch.me/{user.handle}</strong> will return 404 and
              your résumé and photo are removed from view. You can sign up
              again later with the same email if you change your mind — you'll
              get a new handle.
            </p>
            <DeleteButton handle={user.handle} />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">warmpitch.me</div>
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
