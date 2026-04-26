import type { MetadataRoute } from "next";

// warmpitch.me is built for AI agents fetching pages on demand, NOT for
// search engine results. Block the well-known indexers so we never show up
// in Google/Bing/etc., while leaving the door open for AI fetchers
// (ClaudeBot, GPTBot, ChatGPT-User, PerplexityBot, etc.) and the social
// preview bots (Twitterbot, facebookexternalhit, Slackbot) that power link
// cards.
//
// Note: Google-Extended is Google's AI-training crawler, separate from
// Googlebot. We deliberately don't block it — Gemini training is welcome.
const SEARCH_ENGINE_BOTS = [
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "Googlebot-Video",
  "AdsBot-Google",
  "Bingbot",
  "msnbot",
  "Slurp",
  "DuckDuckBot",
  "Baiduspider",
  "YandexBot",
  "YandexImages",
  "Sogou",
  "Exabot",
  "ia_archiver",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...SEARCH_ENGINE_BOTS.map((userAgent) => ({
        userAgent,
        disallow: "/",
      })),
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/setup", "/signup"],
      },
    ],
    host: "https://warmpitch.me",
  };
}
