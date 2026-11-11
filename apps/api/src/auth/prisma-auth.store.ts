import { Injectable } from '@nestjs/common';
import {
  AuthenticationStorage,
  type MfaStore,
  type SessionRecord,
  type SessionStore,
  type TotpRecord,
} from '@nestjs/authentication';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

type SessionRow = {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
  mfa: string | null;
  metadata: Prisma.JsonValue | null;
};

/** Optional fields come back absent, never null (the store contract). */
function toSession(row: SessionRow): SessionRecord {
  const record: SessionRecord = {
    id: row.id,
    userId: row.userId,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
    lastActiveAt: row.lastActiveAt,
  };
  if (row.mfa === 'pending' || row.mfa === 'verified') record.mfa = row.mfa;
  if (row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)) {
    record.metadata = row.metadata as Record<string, unknown>;
  }
  return record;
}

const isNotFound = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';

/**
 * Keeps sessions and second-factor state in PostgreSQL. Every method that
 * decides whether something works once is a single conditional statement,
 * so the guarantees hold with any number of API instances.
 */
@Injectable()
export class PrismaAuthenticationStore implements SessionStore, MfaStore {
  constructor(
    private readonly prisma: PrismaService,
    storage: AuthenticationStorage,
  ) {
    storage.registerSource({ sessions: this, mfa: this });
  }

  // --- Sessions ------------------------------------------------------------

  async getSession(id: string): Promise<SessionRecord | undefined> {
    const row = await this.prisma.session.findUnique({ where: { id } });
    return row ? toSession(row) : undefined;
  }

  async createSession(record: SessionRecord): Promise<void> {
    await this.prisma.session.create({
      data: {
        id: record.id,
        userId: record.userId,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
        lastActiveAt: record.lastActiveAt,
        mfa: record.mfa ?? null,
        metadata: (record.metadata as Prisma.InputJsonValue | undefined) ?? Prisma.DbNull,
      },
    });
    // Keep the table bounded.
    await this.prisma.session.deleteMany({ where: { expiresAt: { lte: record.createdAt } } });
  }

  async touchSession(id: string, lastActiveAt: Date): Promise<void> {
    // Conditional: a session deleted by a sign-out stays deleted.
    await this.prisma.session.updateMany({
      where: { id, lastActiveAt: { lt: lastActiveAt } },
      data: { lastActiveAt },
    });
  }

  async deleteSession(id: string): Promise<boolean> {
    const { count } = await this.prisma.session.deleteMany({ where: { id } });
    return count > 0;
  }

  async listUserSessions(userId: string): Promise<SessionRecord[]> {
    const rows = await this.prisma.session.findMany({ where: { userId } });
    return rows.map(toSession);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  // --- Authenticators, recovery codes and failed attempts -------------------

  async getTotp(userId: string): Promise<TotpRecord | undefined> {
    const row = await this.prisma.mfaAuthenticator.findUnique({ where: { userId } });
    if (!row) return undefined;
    const record: TotpRecord = { secret: row.secret, confirmed: row.confirmed };
    if (row.pendingSecret !== null) record.pendingSecret = row.pendingSecret;
    if (row.lastUsedStep !== null) record.lastUsedStep = row.lastUsedStep;
    return record;
  }

  async saveTotp(userId: string, record: TotpRecord | null): Promise<void> {
    if (!record) {
      await this.prisma.mfaAuthenticator.deleteMany({ where: { userId } });
      return;
    }
    // Never lower the claimed step: the record may have been read before a claim.
    await this.prisma.$executeRaw`
      INSERT INTO mfa_authenticators (user_id, secret, confirmed, pending_secret, last_used_step)
      VALUES (${userId}::uuid, ${record.secret}, ${record.confirmed}, ${record.pendingSecret ?? null}, ${record.lastUsedStep ?? null})
      ON CONFLICT (user_id) DO UPDATE SET
        secret = excluded.secret,
        confirmed = excluded.confirmed,
        pending_secret = excluded.pending_secret,
        last_used_step = GREATEST(mfa_authenticators.last_used_step, excluded.last_used_step)`;
  }

  async claimTotpStep(userId: string, step: number): Promise<boolean> {
    // Conditional: a code's time step is accepted once.
    const { count } = await this.prisma.mfaAuthenticator.updateMany({
      where: { userId, OR: [{ lastUsedStep: null }, { lastUsedStep: { lt: step } }] },
      data: { lastUsedStep: step },
    });
    return count === 1;
  }

  async saveRecoveryCodes(userId: string, hashes: string[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.mfaRecoveryCode.deleteMany({ where: { userId } }),
      this.prisma.mfaRecoveryCode.createMany({
        data: [...new Set(hashes)].map((codeHash) => ({ userId, codeHash })),
      }),
    ]);
  }

  async consumeRecoveryCode(userId: string, hash: string): Promise<boolean> {
    try {
      await this.prisma.mfaRecoveryCode.delete({ where: { userId_codeHash: { userId, codeHash: hash } } });
      return true;
    } catch (error) {
      if (isNotFound(error)) return false;
      throw error;
    }
  }

  countRecoveryCodes(userId: string): Promise<number> {
    return this.prisma.mfaRecoveryCode.count({ where: { userId } });
  }

  async recordMfaFailure(userId: string, windowMs: number, now: number): Promise<number> {
    // Insert, then count, each committed on its own (no transaction).
    await this.prisma.mfaFailure.create({ data: { userId, failedAt: new Date(now) } });
    const failures = await this.countMfaFailures(userId, windowMs, now);
    await this.prisma.mfaFailure.deleteMany({ where: { failedAt: { lte: new Date(now - windowMs) } } });
    return failures;
  }

  countMfaFailures(userId: string, windowMs: number, now: number): Promise<number> {
    return this.prisma.mfaFailure.count({
      where: { userId, failedAt: { gt: new Date(now - windowMs) } },
    });
  }

  async clearMfaFailures(userId: string): Promise<void> {
    await this.prisma.mfaFailure.deleteMany({ where: { userId } });
  }
}
