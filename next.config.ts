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
  },
};

export default nextConfig;
