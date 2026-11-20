import path from "node:path";
import type { NextConfig } from "next";

// Monorepo root: lets Next trace and bundle files from packages/*.
const workspaceRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  transpilePackages: ["@4kidstudy/contracts"],
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
