import { notFound } from "next/navigation";
import Link from "next/link";
import Confirm from "./Confirm";
import { verifyTakedownToken } from "@/lib/takedown";
import { getUserById } from "@/lib/users";

export const metadata = { title: "Take down your page" };

export default async function TakedownPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const userId = verifyTakedownToken(token);
  if (!userId) notFound();

  const user = await getUserById(userId);
  if (!user) notFound();

  return (
    <div className="page">
      <header className="site-header">
        <div className="container">
          <Link href="/" className="wordmark">warmpitch.me</Link>
        </div>
      </header>

      <main className="container auth">
        {user.deleted_at ? (
          <div className="auth-card">
            <h1>Already taken down</h1>
            <p className="auth-sub">
              <strong>warmpitch.me/{user.handle}</strong> was removed{" "}
              {fmtDate(user.deleted_at)}. Visiting it now returns 404.
            </p>
            <p className="auth-sub" style={{ marginTop: 16 }}>
              Want to come back? <Link href="/signup">Sign up again</Link> with{" "}
              the same email and you'll get a fresh page.
            </p>
          </div>
        ) : (
          <Confirm
            token={token}
            handle={user.handle}
            name={user.name}
          />
        )}
      </main>

      <footer className="site-footer">
        <div className="container">warmpitch.me</div>
      </footer>
    </div>
  );
}

function fmtDate(d: string | Date | null): string {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
