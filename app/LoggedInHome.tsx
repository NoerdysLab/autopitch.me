import Link from "next/link";

export default function LoggedInHome({
  handle,
  name,
}: {
  handle: string;
  name: string;
}) {
  const firstName = name.split(/\s+/)[0];
  return (
    <div className="page">
      <header className="site-header">
        <div className="container header-row">
          <Link href="/" className="wordmark">autopitch.me</Link>
          <form action="/api/auth/logout" method="post" className="signout-form">
            <button type="submit" className="nav-link">sign out</button>
          </form>
        </div>
      </header>

      <main className="container">
        <section className="hero hero-tight">
          <h1>Welcome back, {firstName}.</h1>
          <p className="lede">Your page is live.</p>
        </section>

        <section className="me-card">
          <div className="me-link">autopitch.me/{handle}</div>
          <div className="me-actions">
            <Link href={`/${handle}`} className="cta cta-secondary">View page</Link>
            <Link href={`/${handle}/edit`} className="cta cta-secondary">Edit</Link>
            <Link href="/dashboard" className="cta">Dashboard</Link>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">autopitch.me · made for Stanford</div>
      </footer>
    </div>
  );
}
