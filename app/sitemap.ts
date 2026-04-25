import type { MetadataRoute } from "next";

// We deliberately don't enumerate user pitch pages — they're individually
// shareable but shouldn't show up in a public site index. The marketing
// surface is just the home page and the signup flow.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: "https://autopitch.me",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://autopitch.me/signup",
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
