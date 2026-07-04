import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sunday School",
    short_name: "Sunday School",
    description:
      "Ward Sunday School presidency tool — teachers, substitutes, and the Come, Follow Me schedule.",
    start_url: `${BASE}/`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#006184",
    icons: [
      { src: `${BASE}/icon-192.png`, sizes: "192x192", type: "image/png" },
      {
        src: `${BASE}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
