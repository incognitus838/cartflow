import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs", "prisma"],
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      {
        pathname: "/demo-products/**",
        search: "",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 86400,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "sonner"],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;