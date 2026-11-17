import type { NextConfig } from "next";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Ensure Prisma Client is always generated even if Vercel overrides build command to `next build`
const prismaClientPath = path.join(process.cwd(), "node_modules", ".prisma", "client");
if (!fs.existsSync(prismaClientPath)) {
  try {
    execSync("npx prisma generate", { stdio: "inherit" });
  } catch (e) {
    console.warn("Could not auto-generate prisma client in next.config.ts:", e);
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
