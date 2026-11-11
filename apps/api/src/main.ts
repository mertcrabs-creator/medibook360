import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestNodeApplication, NodeAdapter } from '@nestjs/platform-node';
import { AppModule } from './app.module.js';
import type { Env } from './config/env.schema.js';

async function bootstrap() {
  // Read before the app exists: trustProxy is an adapter option.
  const trustProxy = process.env.TRUST_PROXY ?? 'loopback';

  const app = await NestFactory.create<NestNodeApplication>(
    AppModule,
    new NodeAdapter({ trustProxy }),
  );
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  const webOrigin = config.get('WEB_ORIGIN', { infer: true });

  // Helmet-equivalent headers (CSP, HSTS, nosniff, frame-ancestors...).
  // The API only returns JSON, so the default strict CSP is fine.
  app.useSecurityHeaders();

  // Rejects cross-site state-changing requests (Fetch Metadata based).
  app.enableCsrfProtection({ trustedOrigins: [webOrigin] });

  // The browser talks to the API through the Next.js proxy (same origin),
  // so CORS only needs to allow the web app itself.
  app.enableCors({ origin: [webOrigin], credentials: true });

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  // Listen on loopback only: in dev, only the local Next.js proxy reaches it.
  await app.listen(config.get('API_PORT', { infer: true }), '127.0.0.1');
}
await bootstrap();
