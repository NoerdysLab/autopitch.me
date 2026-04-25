import { notFound } from "next/navigation";
import { headers } from "next/headers";
import AIButtons from "@/components/AIButtons";
import Avatar from "@/components/Avatar";
import { isValidHandle } from "@/lib/handle";
import { buildPrompt } from "@/lib/prompt";
import { getUserByHandle } from "@/lib/users";

type PageProps = { params: Promise<{ handle: string }> };

export default async function PitchPage({ params }: PageProps) {
  const { handle } = await params;
  if (!isValidHandle(handle)) notFound();

  const user = await getUserByHandle(handle);
  if (!user || user.deleted_at) notFound();

  const h = await headers();
  const host = h.get("host") ?? "autopitch.me";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = `${proto}://${host}`;

  const prompt = buildPrompt({ name: user.name, handle: user.handle, origin });

  return (
    <div className="page">
      <main className="pitch">
        <Avatar name={user.name} photoUrl={user.photo_url} />
        <h1>{user.name}</h1>
        {user.tagline && <p className="tagline">{user.tagline}</p>}
        <AIButtons prompt={prompt} />
      </main>
      <footer className="site-footer">
        <div className="container">autopitch.me</div>
      </footer>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;
  if (!isValidHandle(handle)) return {};
  const user = await getUserByHandle(handle);
  if (!user) return {};
  return {
    title: `${user.name} · autopitch.me`,
    description: user.tagline ?? `Pitch ${user.name} to anyone with one click.`,
  };
}
