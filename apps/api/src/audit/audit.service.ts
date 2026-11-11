import { Injectable, Logger } from '@nestjs/common';
import type { IncomingHttpHeaders } from 'node:http';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

/** The parts of an HTTP request the audit trail records. */
export interface RequestLike {
  ip?: string;
  headers: IncomingHttpHeaders;
}

export interface ClientInfo {
  ip: string | null;
  userAgent: string | null;
}

export function clientInfo(req: RequestLike): ClientInfo {
  const ua = req.headers['user-agent'];
  return {
    ip: req.ip ?? null,
    userAgent: typeof ua === 'string' ? ua.slice(0, 512) : null,
  };
}

export type AuditAction =
  | 'setup-completed'
  | 'sign-in'
  | 'sign-in-failed'
  | 'mfa-verified'
  | 'mfa-failed'
  | 'mfa-enabled'
  | 'recovery-codes-regenerated'
  | 'password-changed'
  | 'session-revoked'
  | 'sessions-revoked-others'
  | 'sign-out';

/**
 * Append-only security log. Writes never fail the request: a lost audit row
 * is logged loudly instead.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(
    action: AuditAction,
    { userId = null, client, details }: { userId?: string | null; client?: ClientInfo; details?: Record<string, unknown> },
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          userId,
          ip: client?.ip ?? null,
          userAgent: client?.userAgent ?? null,
          details: (details as Prisma.InputJsonValue | undefined) ?? Prisma.DbNull,
        },
      });
    } catch (error) {
      this.logger.error(`Audit write failed for "${action}"`, error instanceof Error ? error.stack : error);
    }
  }
}
