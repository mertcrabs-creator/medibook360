import { Module, StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { AuthenticationModule } from '@nestjs/authentication';
import { ThrottlerGuard, ThrottlerModule, minutes, normalizeIp } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module.js';
import { AuditModule } from './audit/audit.module.js';
import { accountEmail } from './auth/account-email.js';
import { AuthModule } from './auth/auth.module.js';
import { envSchema, type Env } from './config/env.schema.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      // One .env at the monorepo root, shared with docker-compose.
      // In production, variables come from the environment only.
      envFilePath: ['../../.env'],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: envSchema,
    }),
    // Global guards run in module order: the throttler (root module) runs
    // first, so guessed credentials count against the limits too.
    ThrottlerModule.forRoot([
      // Per IP address, on every route.
      { name: 'default', ttl: minutes(1), limit: 120 },
      // Per email and IP address, wherever the request body names an account.
      {
        name: 'account',
        ttl: minutes(15),
        limit: 5,
        skipIf: (context) => !accountEmail(context.switchToHttp().getRequest()),
        getTracker: (req) => `${accountEmail(req)}|${normalizeIp(req.ip)}`,
      },
    ]),
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        session: {
          // An admin panel: short lifetimes. Signed out after 12 hours however
          // active, or after 30 minutes without a request.
          absoluteTtl: '12h',
          idleTtl: '30m',
          touchInterval: '1m',
          cookie: { secure: true, sameSite: 'strict', path: '/' },
          trustedOrigins: [config.get('WEB_ORIGIN', { infer: true })],
          metadata: (request) => ({
            userAgent: String(request.headers['user-agent'] ?? '').slice(0, 512) || null,
            ip: request.ip ?? null,
          }),
        },
        mfa: {
          issuer: 'MediBook360',
          encryption: { keys: [config.get('TOTP_ENCRYPTION_KEY', { infer: true })] },
        },
      }),
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    AdminModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_PIPE, useValue: new StandardSchemaValidationPipe() },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
