import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import EditClient from "./EditClient";
import { isValidHandle } from "@/lib/handle";
import { getSession } from "@/lib/session";
import { getUserByHandle } from "@/lib/users";

export const metadata = { title: "Edit your page" };

export default async function EditPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  if (!isValidHandle(handle)) notFound();

  const user = await getUserByHandle(handle);
  if (!user || user.deleted_at) notFound();

  // Owner-only. Other people land on the public pitch page.
  const session = await getSession();
  if (session.email !== user.email) {
    redirect(`/${user.handle}`);
  }

  return (
    <div className="page">
      <header className="site-header">
        <div className="container header-row">
          <Link href="/" className="wordmark">autopitch.me</Link>
          <Link href={`/${user.handle}`} className="nav-link">
            view page →
          </Link>
        </div>
      </header>

      <main className="container auth">
        <EditClient
          handle={user.handle}
          name={user.name}
          tagline={user.tagline ?? ""}
          linkedinUrl={user.linkedin_url ?? ""}
          resumeMd={user.resume_md}
          photoUrl={user.photo_url}
        />
      </main>

      <footer className="site-footer">
        <div className="container">autopitch.me</div>
      </footer>
    </div>
  );
}
