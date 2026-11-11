import { Controller, Get, Query } from '@nestjs/common';
import { z } from 'zod';
import { PanelAccess } from '../auth/panel-access.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';

const auditQuerySchema = z.object({
  cursor: z.string().regex(/^\d{1,19}$/).optional(),
  action: z.string().regex(/^[a-z-]{1,40}$/).optional(),
});

const DAY = 24 * 60 * 60 * 1000;

@PanelAccess()
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  /** Numbers for the dashboard. */
  @Get('overview')
  async overview() {
    const since = new Date(Date.now() - DAY);
    const started = performance.now();
    const [admins, activeSessions, signIns24h, failed24h, recent] = await Promise.all([
      this.prisma.user.count({ where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] }, status: 'ACTIVE' } }),
      this.prisma.session.count({ where: { expiresAt: { gt: new Date() }, mfa: 'verified' } }),
      this.prisma.auditLog.count({ where: { action: 'sign-in', createdAt: { gte: since } } }),
      this.prisma.auditLog.count({
        where: { action: { in: ['sign-in-failed', 'mfa-failed'] }, createdAt: { gte: since } },
      }),
      this.recentAudit(8),
    ]);
    return {
      admins,
      activeSessions,
      signIns24h,
      failed24h,
      recent,
      system: {
        database: { status: 'up', latencyMs: Math.round(performance.now() - started) },
        api: { status: 'up', uptimeSeconds: Math.round(process.uptime()), node: process.version },
      },
    };
  }

  @Get('audit-logs')
  async auditLogs(@Query({ schema: auditQuerySchema }) query: z.infer<typeof auditQuerySchema>) {
    const take = 50;
    const rows = await this.prisma.auditLog.findMany({
      where: {
        ...(query.action ? { action: query.action } : {}),
        ...(query.cursor ? { id: { lt: BigInt(query.cursor) } } : {}),
      },
      orderBy: { id: 'desc' },
      take: take + 1,
    });
    const page = rows.slice(0, take);
    return {
      items: await this.withUsers(page),
      nextCursor: rows.length > take ? page[page.length - 1]!.id.toString() : null,
    };
  }

  private async recentAudit(take: number) {
    const rows = await this.prisma.auditLog.findMany({ orderBy: { id: 'desc' }, take });
    return this.withUsers(rows);
  }

  private async withUsers(
    rows: { id: bigint; userId: string | null; action: string; ip: string | null; userAgent: string | null; details: unknown; createdAt: Date }[],
  ) {
    const ids = [...new Set(rows.map((r) => r.userId).filter((id): id is string => Boolean(id)))];
    const users = ids.length
      ? await this.prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, email: true } })
      : [];
    const byId = new Map(users.map((u) => [u.id, u]));
    return rows.map((r) => ({
      id: r.id.toString(),
      action: r.action,
      ip: r.ip,
      userAgent: r.userAgent,
      details: r.details,
      createdAt: r.createdAt,
      user: r.userId ? (byId.get(r.userId) ?? null) : null,
    }));
  }
}
