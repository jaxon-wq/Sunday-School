import type { NextConfig } from "next";

// GitHub Pages serves from https://<user>.github.io/Sunday-School/
const basePath = process.env.GITHUB_ACTIONS ? "/Sunday-School" : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  // Deterministic, underscore-free build id (Pages-safe and reproducible)
  generateBuildId: async () =>
    process.env.GITHUB_SHA ? `b${process.env.GITHUB_SHA.slice(0, 12)}` : "dev",
  env: {
    // Plain <img>/<a> URLs don't get basePath automatically — components
    // that reference /public assets prefix with this.
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_MANTLE_NS:
      process.env.NEXT_PUBLIC_MANTLE_NS ?? "ss-3110c6ff",
    NEXT_PUBLIC_MANTLE_KEY:
      process.env.NEXT_PUBLIC_MANTLE_KEY ??
      "1212399d7a020b7bc15c7c5e46a1fcc239af4bf9d95e0bb61365fc7ffab02ba3",
  },
};

export default nextConfig;
