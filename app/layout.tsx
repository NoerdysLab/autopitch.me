import type { Metadata, Viewport } from "next";
import "./globals.css";

// Without this, mobile browsers render the page at desktop width (~980px)
// and shrink it to fit the screen, defeating every responsive media query.
// device-width + initialScale 1 makes mobile render at the actual viewport
// size so CSS sees the real device width.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f7f4",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://warmpitch.me"),
  title: {
    default: "warmpitch.me",
    template: "%s · warmpitch.me",
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
    siteName: "warmpitch.me",
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
