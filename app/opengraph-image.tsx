import { ImageResponse } from "next/og";

// 1200x630 is the size every social card shows at 1:1 — anything else gets
// downscaled or letter-boxed. Keep this file in sync with /[handle]/opengraph-image.tsx.
export const alt = "warmpitch.me — your résumé, one click away from any AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function HomeOG() {
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
          padding: "72px 80px",
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.01em", display: "flex" }}>
          warmpitch.me
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            marginTop: 40,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Your résumé,</span>
            <span>one click away</span>
            <span>from any AI.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            color: "#6b6b73",
          }}
        >
          <div style={{ display: "flex" }}>Made for Stanford students.</div>
          <div style={{ display: "flex" }}>Claim your page →</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
