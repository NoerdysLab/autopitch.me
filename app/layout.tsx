import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://autopitch.me"),
  title: {
    default: "autopitch.me",
    template: "%s · autopitch.me",
  },
  description:
    "Paste your résumé, get a short link. Anyone clicking it opens an AI that pitches you to them.",
  // Belt-and-suspenders for the robots.txt block above: even if a search
  // engine ignores robots.txt and crawls anyway, the noindex meta tag tells
  // it not to add the page to its index. follow:true keeps the door open
  // for AI agents that traverse links between pages.
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "autopitch.me",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
