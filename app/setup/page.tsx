import { redirect } from "next/navigation";
import Link from "next/link";
import SetupClient from "./SetupClient";
import { getSession } from "@/lib/session";
import { getUserByEmail } from "@/lib/users";

export const metadata = { title: "Set up your page" };

export default async function SetupPage() {
  const session = await getSession();
  if (!session.email) redirect("/signup");

  const existing = await getUserByEmail(session.email);
  if (existing) redirect(`/${existing.handle}`);

  return (
    <div className="page">
      <header className="site-header">
        <div className="container">
          <Link href="/" className="wordmark">autopitch.me</Link>
        </div>
      </header>
      <main className="container auth">
        <SetupClient email={session.email} />
      </main>
      <footer className="site-footer">
        <div className="container">autopitch.me · made for Stanford</div>
      </footer>
    </div>
  );
}
