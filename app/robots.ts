import type { MetadataRoute } from "next";

// We *want* AI agents to crawl pitch pages and especially the raw markdown
// at /<handle>r — that's the whole point of the product. Any crawler is
// welcome on the public pages; only auth flows and internal APIs are off
// limits.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/setup", "/signup"],
    },
    host: "https://autopitch.me",
    sitemap: "https://autopitch.me/sitemap.xml",
  };
}
