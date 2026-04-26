import Link from "next/link";

// Centered wordmark with a right-aligned action group, used on every
// authenticated page. All four nav targets are always visible — even
// when you're already on one of them — so the layout doesn't reflow as
// you move between pages.

export default function OwnerHeader({ handle }: { handle: string }) {
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="wordmark" aria-label="warmpitch.me">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="warmpitch.me" />
        </Link>
        <div className="nav">
          <Link href={`/${handle}`} className="nav-pill">view page</Link>
          <Link href={`/${handle}/edit`} className="nav-pill">edit</Link>
          <Link href="/dashboard" className="nav-pill">dashboard</Link>
          <form action="/api/auth/logout" method="post" className="signout-form">
            <button type="submit" className="nav-pill">sign out</button>
          </form>
        </div>
      </div>
    </header>
  );
}
