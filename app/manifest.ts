import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ReelFit AI",
    short_name: "ReelFit AI",
    description: "Generate viral Instagram Reel ideas for fitness coaches in seconds.",
    start_url: "/",
    display: "standalone",
    background_color: "#090c12",
    theme_color: "#10B981",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  };
}
