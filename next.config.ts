import type { NextConfig } from "next";

// When building on GitHub Actions we serve from https://<user>.github.io/Sunday-School/
const basePath = process.env.GITHUB_ACTIONS ? "/Sunday-School" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
};

export default nextConfig;
