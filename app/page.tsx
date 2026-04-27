import Link from "next/link";
import HomeDemo from "@/components/HomeDemo";
import LoggedInHome from "./LoggedInHome";
import { getSession } from "@/lib/session";
import { getUserByEmail } from "@/lib/users";

export default async function Home() {
  const session = await getSession();
  const user = session.email ? await getUserByEmail(session.email) : null;

  // Logged-in & onboarded → show the user's command center.
  if (user && !user.deleted_at) {
    return <LoggedInHome handle={user.handle} name={user.name} />;
  }

  return (
    <div className="page">
      <header className="site-header site-header-centered">
        <div className="container">
          <Link href="/" className="wordmark" aria-label="warmpitch.me">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="warmpitch.me" />
          </Link>
        </div>
      </header>

      <main>
        <section className="container hero hero-tight">
          <h1>Your résumé, personally pitched by their AI</h1>
        </section>

        <section className="container cta-row cta-row-tight">
          <Link href="/signup" className="cta">
            Claim your page or sign in
          </Link>
        </section>

        <section className="container demo-section">
          <HomeDemo />
        </section>

        <section className="container">
          <div className="steps steps-tight">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Paste your résumé</h3>
              <p>Markdown or plain text. Takes 30 seconds.</p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>Get your link</h3>
              <p>warmpitch.me/x4k9 — short, memorable, yours.</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Share it</h3>
              <p>Your recruiter&apos;s AI knows them best, and pitches you.</p>
            </div>
          </div>
        </section>

        <section className="container cta-row cta-row-tight">
          <Link href="/signup" className="cta">
            Claim your page or sign in
          </Link>
          <span className="cta-sub">
            Stanford students, free. <Link href="/x4k9">see a sample →</Link>
          </span>
          <span className="cta-foot">
            Actively updating as LLMs improve — currently designed for Claude.
          </span>
        </section>
      </main>

      <footer className="site-footer site-footer-tight">
        <div className="container">warmpitch.me · made for Stanford</div>
      </footer>
    </div>
  );
}
