import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "autopitch.me",
  description:
    "Paste your resume, get a short link. Anyone clicking it opens an AI that pitches you to them.",
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
