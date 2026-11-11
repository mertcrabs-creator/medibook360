import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CurrentSession, CurrentUser, MfaService, SessionService, SignInService, type SessionRecord } from '@nestjs/authentication';
import { Throttle, minutes } from '@nestjs/throttler';
import { z } from 'zod';
import { AuditService, clientInfo, type RequestLike } from '../audit/audit.service.js';
import { UsersRepository } from '../users/users.repository.js';
import { changePasswordSchema, type ChangePasswordDto } from './auth.schemas.js';
import { CredentialsService } from './credentials.service.js';
import { PanelAccess } from './panel-access.guard.js';

const sessionIdSchema = z.string().regex(/^[A-Za-z0-9_-]{16,128}$/);

/** The signed-in admin's own security settings. */
@PanelAccess()
@Controller('account')
export class AccountController {
  constructor(
    private readonly sessions: SessionService,
    private readonly signInService: SignInService,
    private readonly mfa: MfaService,
    private readonly credentials: CredentialsService,
    private readonly users: UsersRepository,
    private readonly audit: AuditService,
  ) {}

  @Get('security')
  async security(@CurrentUser('id') userId: string) {
    return {
      mfaEnrolled: await this.mfa.isEnrolled(userId),
      recoveryCodesLeft: await this.mfa.remainingRecoveryCodes(userId),
    };
  }

  @Get('sessions')
  async list(@CurrentUser('id') userId: string, @CurrentSession() current: SessionRecord) {
    const sessions = await this.sessions.list(userId);
    const now = Date.now();
    return sessions
      .filter((s) => s.expiresAt.getTime() > now)
      .sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime())
      .map(({ id, createdAt, lastActiveAt, expiresAt, metadata }) => ({
        id,
        createdAt,
        lastActiveAt,
        expiresAt,
        userAgent: typeof metadata?.userAgent === 'string' ? metadata.userAgent : null,
        ip: typeof metadata?.ip === 'string' ? metadata.ip : null,
        current: id === current.id,
      }));
  }

  // revoke() only ends a session of this user: another user's id is a 404.
  @Delete('sessions/:id')
  @HttpCode(204)
  async revoke(@CurrentUser('id') userId: string, @Param('id', { schema: sessionIdSchema }) id: string, @Req() req: RequestLike) {
    if (!(await this.sessions.revoke(id, { userId }))) {
      throw new NotFoundException();
    }
    await this.audit.record('session-revoked', { userId, client: clientInfo(req) });
  }

  @Post('sessions/revoke-others')
  @HttpCode(204)
  async revokeOthers(@CurrentUser('id') userId: string, @CurrentSession() current: SessionRecord, @Req() req: RequestLike) {
    await this.sessions.revokeAll(userId, { except: current.id });
    await this.audit.record('sessions-revoked-others', { userId, client: clientInfo(req) });
  }

  @Post('password')
  @HttpCode(204)
  @Throttle({ default: { limit: 10, ttl: minutes(15) } })
  async changePassword(
    @CurrentUser('id') userId: string,
    @CurrentSession() current: SessionRecord,
    @Body({ schema: changePasswordSchema }) body: ChangePasswordDto,
    @Req() req: RequestLike,
  ) {
    if (!(await this.credentials.verifyForUser(userId, body.currentPassword))) {
      throw new UnauthorizedException({ message: 'Mevcut şifre hatalı.', errorCode: 'invalid_password' });
    }
    await this.users.updatePasswordHash(userId, await this.credentials.hash(body.newPassword));
    // Whoever knew the old password may still be signed in elsewhere.
    await this.sessions.revokeAll(userId, { except: current.id });
    await this.signInService.rotateSession();
    await this.audit.record('password-changed', { userId, client: clientInfo(req) });
  }
}
