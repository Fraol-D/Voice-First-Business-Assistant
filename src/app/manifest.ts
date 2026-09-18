import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Voice-First Business Assistant",
    short_name: "Business Assistant",
    description: "Record business activity and ask questions about your business.",
    start_url: "/assistant",
    display: "standalone",
    background_color: "#171614",
    theme_color: "#171614",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}