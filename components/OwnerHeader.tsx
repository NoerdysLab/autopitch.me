import Link from "next/link";

// Centered wordmark with a right-aligned action group used on every
// authenticated page (pitch when owner, edit, dashboard). Pass a list of
// items and we render them as outlined pills, plus a sign-out form
// button on the right.

export type OwnerNavKey = "view" | "edit" | "dashboard";

const LABELS: Record<OwnerNavKey, string> = {
  view: "view page",
  edit: "edit",
  dashboard: "dashboard",
};

export default function OwnerHeader({
  handle,
  show,
}: {
  handle: string;
  // Which links to show. Caller omits the link for the page they're on.
  show: OwnerNavKey[];
}) {
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="wordmark">
          autopitch.me
        </Link>
        <div className="nav">
          {show.map((key) => (
            <Link
              key={key}
              href={hrefFor(key, handle)}
              className="nav-pill"
            >
              {LABELS[key]}
            </Link>
          ))}
          <form action="/api/auth/logout" method="post" className="signout-form">
            <button type="submit" className="nav-pill">sign out</button>
          </form>
        </div>
      </div>
    </header>
  );
}

function hrefFor(key: OwnerNavKey, handle: string): string {
  switch (key) {
    case "view": return `/${handle}`;
    case "edit": return `/${handle}/edit`;
    case "dashboard": return "/dashboard";
  }
}
