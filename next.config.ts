import type { NextConfig } from "next";

if (process.env.NEXT_PUBLIC_TYPESAFE_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
  throw new Error(
    "Do not expose API keys as NEXT_PUBLIC_ variables. Use TYPESAFE_API_KEY on the server only.",
  );
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(basePath ? { basePath } : {}),
  ...(isGitHubPages
    ? {
        output: "export" as const,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
