import Link from "next/link";
import OwnerHeader from "@/components/OwnerHeader";

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
      <OwnerHeader handle={handle} />

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

      <footer className="site-footer site-footer-tight">
        <div className="container">autopitch.me · made for Stanford</div>
      </footer>
    </div>
  );
}
