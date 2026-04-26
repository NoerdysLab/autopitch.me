import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { isValidHandle } from "@/lib/handle";
import { getUserByHandle } from "@/lib/users";

export const alt = "warmpitch.me pitch page";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function HandleOG({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  if (!isValidHandle(handle)) notFound();
  const user = await getUserByHandle(handle);
  if (!user || user.deleted_at) notFound();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f8f7f4",
          color: "#1a1a1e",
          display: "flex",
          flexDirection: "column",
          padding: "56px 80px",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            display: "flex",
          }}
        >
          warmpitch.me
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 200,
              background: "#ffffff",
              border: "2px solid #e8e6e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 76,
              fontWeight: 600,
              color: "#6b6b73",
              letterSpacing: "-0.02em",
            }}
          >
            {initials(user.name)}
          </div>

          <div
            style={{
              fontSize: 72,
              fontWeight: 600,
              letterSpacing: "-0.025em",
              display: "flex",
              textAlign: "center",
            }}
          >
            {user.name}
          </div>

          {user.tagline && (
            <div
              style={{
                fontSize: 32,
                color: "#6b6b73",
                display: "flex",
                textAlign: "center",
                maxWidth: 900,
              }}
            >
              {user.tagline}
            </div>
          )}
        </div>

        <div
          style={{
            fontSize: 24,
            color: "#6b6b73",
            display: "flex",
            justifyContent: "center",
          }}
        >
          warmpitch.me/{user.handle}
        </div>
      </div>
    ),
    { ...size },
  );
}
