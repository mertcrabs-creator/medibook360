import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '@nestjs/authentication';
import { PrismaService } from '../prisma/prisma.service.js';

@Public()
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  /** Liveness: the process is up. Never touches dependencies. */
  @Get('live')
  live() {
    return { status: 'ok' };
  }

  /** Readiness: the API can serve traffic (database reachable). */
  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([() => this.prismaHealth.pingCheck('database', this.prisma)]);
  }
}
