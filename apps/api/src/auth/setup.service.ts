import { ConflictException, ForbiddenException, Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { normalizeEmail, PANEL_ROLES, type User } from '../users/user.js';
import { UsersRepository } from '../users/users.repository.js';
import type { SetupDto } from './auth.schemas.js';
import { CredentialsService } from './credentials.service.js';

// No look-alike characters (0/O, 1/I/L), so it can be typed from a screen.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
// Any constant: serializes concurrent setup attempts in PostgreSQL.
const SETUP_LOCK_KEY = 360_360_001;

/**
 * First-run setup: creates the first super admin.
 *
 * While no panel user exists, the API generates a one-time setup code at
 * startup and prints it to its own console. Only someone who can read the
 * server's logs can complete setup, so a stranger who finds the setup page
 * first can't claim the panel. The code changes on every restart, and stops
 * working the moment an admin exists.
 */
@Injectable()
export class SetupService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Setup');
  private tokenHash: Buffer | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersRepository,
    private readonly credentials: CredentialsService,
  ) {}

  async onApplicationBootstrap() {
    if (!(await this.isRequired())) return;
    const token = Array.from({ length: 4 }, () =>
      Array.from({ length: 5 }, () => ALPHABET[randomInt(ALPHABET.length)]).join(''),
    ).join('-');
    this.tokenHash = sha256(token);
    const line = '='.repeat(64);
    this.logger.warn(
      [
        '',
        line,
        '  MediBook360 kurulumu bekliyor: henüz yönetici hesabı yok.',
        '',
        '  1) Tarayıcıda açın:  http://localhost:3000/yonetim/kurulum',
        `  2) Kurulum kodu:     ${token}`,
        '',
        '  Kod tek kullanımlıktır ve API yeniden başlayınca değişir.',
        line,
      ].join('\n'),
    );
  }

  async isRequired(): Promise<boolean> {
    return (await this.users.countByRole(PANEL_ROLES)) === 0;
  }

  async complete(dto: SetupDto): Promise<User> {
    if (!this.tokenHash || !safeEqual(sha256(dto.setupToken.toUpperCase()), this.tokenHash)) {
      throw new ForbiddenException({ message: 'Kurulum kodu geçersiz.', errorCode: 'invalid_setup_token' });
    }
    const passwordHash = await this.credentials.hash(dto.password);

    const user = await this.prisma.$transaction(async (tx) => {
      // Two setup requests at once: the second waits here, then finds the admin.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${SETUP_LOCK_KEY})`;
      const existing = await tx.user.count({ where: { role: { in: [...PANEL_ROLES] } } });
      if (existing > 0) return null;
      return tx.user.create({
        data: {
          email: normalizeEmail(dto.email),
          name: dto.name,
          passwordHash,
          role: 'SUPER_ADMIN',
        },
        select: { id: true, email: true, name: true, role: true, status: true, lastLoginAt: true, createdAt: true },
      });
    });

    if (!user) {
      this.tokenHash = null;
      throw new ConflictException({ message: 'Kurulum zaten tamamlanmış.', errorCode: 'setup_done' });
    }
    this.tokenHash = null;
    this.logger.log(`Kurulum tamamlandı. İlk yönetici: ${user.email}`);
    return user;
  }
}

const sha256 = (value: string) => createHash('sha256').update(value.trim()).digest();
const safeEqual = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);
