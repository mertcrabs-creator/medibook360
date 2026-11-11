import { z } from 'zod';

/**
 * Every environment variable the API reads. Startup fails with a readable
 * list of problems if anything is missing or malformed, so a misconfigured
 * deployment never boots half-working.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),

  /** Public origin of the Next.js app; the only origin allowed by CORS/CSRF. */
  WEB_ORIGIN: z.url(),

  DATABASE_URL: z
    .string()
    .startsWith('postgresql://', 'DATABASE_URL must be a postgresql:// URL'),
  VALKEY_URL: z.string().startsWith('redis://', 'VALKEY_URL must be a redis:// URL'),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535),

  /**
   * Proxies whose X-Forwarded-* headers are trusted. `loopback` is right
   * for local dev (Next.js proxies on the same machine). Production sets the
   * load balancer's subnet.
   */
  TRUST_PROXY: z.string().default('loopback'),

  /**
   * AES-256-GCM key that encrypts TOTP secrets at rest. At least 32
   * characters of random data (`pnpm setup:env` generates one).
   */
  TOTP_ENCRYPTION_KEY: z.string().min(32, 'TOTP_ENCRYPTION_KEY must be at least 32 random characters'),
});

export type Env = z.infer<typeof envSchema>;
