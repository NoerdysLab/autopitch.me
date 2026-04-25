import Link from "next/link";

export default function Home() {
  return (
    <div className="page">
      <header className="site-header">
        <div className="container">
          <Link href="/" className="wordmark">
            autopitch.me
          </Link>
        </div>
      </header>

      <main>
        <section className="container hero">
          <h1>Your résumé, one click away from any AI.</h1>
          <p className="lede">
            Paste your résumé. Get a short link. Anyone you share it with
            opens an AI that already knows who you are — and pitches you to
            them.
          </p>
        </section>

        <section className="container">
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Paste your résumé</h3>
              <p>Markdown or plain text. Takes 30 seconds.</p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>Get your link</h3>
              <p>autopitch.me/x4k9 — short, memorable, yours.</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Share it</h3>
              <p>Recruiters, investors, friends — one click and AI does the talking.</p>
            </div>
          </div>
        </section>

        <section className="container cta-row">
          <Link href="/signup" className="cta">
            Claim your page
          </Link>
          <span className="cta-sub">
            Stanford students, free. <Link href="/x4k9">see a sample →</Link>
          </span>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">autopitch.me · made for Stanford</div>
      </footer>
    </div>
  );
}
