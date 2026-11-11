import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { NextConfig } from "next";

// Single .env at the monorepo root (shared with the API and docker-compose).
// Variables already set in the environment win (production sets them there).
const rootEnv = resolve(process.cwd(), "../../.env");
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const apiUrl = process.env.API_INTERNAL_URL;
if (!apiUrl) {
  throw new Error("API_INTERNAL_URL is not set. Run `pnpm setup:env` at the repo root.");
}

const isDev = process.env.NODE_ENV === "development";

/**
 * Baseline Content-Security-Policy.
 * TODO(security): script-src still allows inline scripts. Choose between a
 * nonce-based policy (forces dynamic rendering) and SRI hashes once the
 * public pages exist; see docs/decisions.md (006).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    // geolocation=self: "nearest clinic / emergency" features ask for location.
    value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // The browser only ever talks to this origin. /api/* is forwarded to the
  // NestJS API, so auth cookies stay first-party and the API is not exposed.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
