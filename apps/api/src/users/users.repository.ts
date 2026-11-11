import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { normalizeEmail, type User, type UserRole } from './user.js';

const PUBLIC_FIELDS = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

/**
 * The only place that reads the users table. Password hashes stay inside:
 * everything it returns is a `User` without one.
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id }, select: PUBLIC_FIELDS });
  }

  /** For password sign-in only. */
  async findCredentials(email: string): Promise<{ user: User; passwordHash: string | null } | null> {
    const row = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      select: { ...PUBLIC_FIELDS, passwordHash: true },
    });
    if (!row) return null;
    const { passwordHash, ...user } = row;
    return { user, passwordHash };
  }

  async getPasswordHash(id: string): Promise<string | null> {
    const row = await this.prisma.user.findUnique({ where: { id }, select: { passwordHash: true } });
    return row?.passwordHash ?? null;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  async markSignedIn(id: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  }

  countByRole(roles: readonly UserRole[]): Promise<number> {
    return this.prisma.user.count({ where: { role: { in: [...roles] } } });
  }
}
