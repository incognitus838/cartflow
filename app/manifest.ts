import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CartFlow",
    short_name: "CartFlow",
    description: "Social commerce storefronts for WhatsApp sellers",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfbfd",
    theme_color: "#1a7f5a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}