import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  basePath: "/kredia-app", // Replace with your actual repo name
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
