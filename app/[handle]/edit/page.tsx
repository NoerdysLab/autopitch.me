import { redirect, notFound } from "next/navigation";
import EditClient from "./EditClient";
import OwnerHeader from "@/components/OwnerHeader";
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
      <OwnerHeader handle={user.handle} />

      <main className="container auth">
        <EditClient
          handle={user.handle}
          name={user.name}
          tagline={user.tagline ?? ""}
          linkedinUrl={user.linkedin_url ?? ""}
          instagramUrl={user.instagram_url ?? ""}
          xUrl={user.x_url ?? ""}
          theme={user.theme}
          resumeMd={user.resume_md}
          photoUrl={user.photo_url}
        />
      </main>

      <footer className="site-footer">
        <div className="container">warmpitch.me</div>
      </footer>
    </div>
  );
}
