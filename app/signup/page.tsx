import { redirect } from "next/navigation";
import Link from "next/link";
import SignupClient from "./SignupClient";
import { getSession } from "@/lib/session";
import { getUserByEmail } from "@/lib/users";

export const metadata = { title: "Sign up" };

export default async function SignupPage() {
  const session = await getSession();

  // Already verified — bounce them to their pitch page or onboarding.
  if (session.email) {
    const user = await getUserByEmail(session.email);
    redirect(user ? `/${user.handle}` : "/setup");
  }

  return (
    <div className="page">
      <header className="site-header">
        <div className="container">
          <Link href="/" className="wordmark">autopitch.me</Link>
        </div>
      </header>

      <main className="container auth">
        <SignupClient initialPendingEmail={session.pending_email ?? null} />
      </main>

      <footer className="site-footer">
        <div className="container">autopitch.me · made for Stanford</div>
      </footer>
    </div>
  );
}
