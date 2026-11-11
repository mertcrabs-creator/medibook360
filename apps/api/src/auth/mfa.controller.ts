import { Body, ConflictException, Controller, HttpCode, Post, Req, UnauthorizedException } from '@nestjs/common';
import {
  Authenticate,
  CurrentUser,
  MfaService,
  Public,
  SessionService,
  SignInService,
} from '@nestjs/authentication';
import { Throttle, minutes } from '@nestjs/throttler';
import { AuditService, clientInfo, type RequestLike } from '../audit/audit.service.js';
import type { User } from '../users/user.js';
import { UsersRepository } from '../users/users.repository.js';
import { codeSchema, verifyMfaSchema, type CodeDto, type VerifyMfaDto } from './auth.schemas.js';
import { sessionOwner } from './session-owner.js';

const INVALID_CODE = { message: 'Kod hatalı ya da süresi geçmiş.', errorCode: 'invalid_code' };

@Controller('auth/mfa')
export class MfaController {
  constructor(
    private readonly mfa: MfaService,
    private readonly signInService: SignInService,
    private readonly sessions: SessionService,
    private readonly users: UsersRepository,
    private readonly audit: AuditService,
  ) {}

  /**
   * Starts enrolling an authenticator: the otpauth:// URI for the QR code,
   * and the secret for typing in. Refused once one is confirmed.
   */
  @Post('enroll')
  @HttpCode(200)
  async enroll(@CurrentUser() user: User) {
    if (await this.mfa.isEnrolled(user.id)) {
      throw new ConflictException({ message: 'İki adımlı doğrulama zaten etkin.', errorCode: 'mfa_enrolled' });
    }
    return this.mfa.enroll(user.id, user.email);
  }

  /**
   * The first code proves the authenticator works; this session becomes
   * verified under a new cookie. Recovery codes are shown once.
   */
  @Post('confirm')
  @HttpCode(200)
  async confirm(@CurrentUser('id') userId: string, @Body({ schema: codeSchema }) body: CodeDto, @Req() req: RequestLike) {
    if (!(await this.signInService.confirmMfa(userId, body.code))) {
      throw new UnauthorizedException(INVALID_CODE);
    }
    const client = clientInfo(req);
    // Turning 2FA on is a privilege change: sessions signed in with the
    // password alone end here. confirmMfa() just rotated this browser's
    // session to a new, verified one, so that is the only one kept.
    for (const session of await this.sessions.list(userId)) {
      if (session.mfa !== 'verified') await this.sessions.revoke(session.id, { userId });
    }
    await this.audit.record('mfa-enabled', { userId, client });
    return { recoveryCodes: await this.mfa.generateRecoveryCodes(userId) };
  }

  /**
   * Second step of signing in. A pending session counts as signed in
   * nowhere, so the route is public: completeMfa() reads the session cookie.
   * The package locks the account's codes after 5 failures in 15 minutes.
   */
  @Public()
  @Post('verify')
  @HttpCode(200)
  @Throttle({ default: { limit: 30, ttl: minutes(15) } })
  async verify(@Body({ schema: verifyMfaSchema }) body: VerifyMfaDto, @Req() req: RequestLike) {
    const client = clientInfo(req);
    const owner = await sessionOwner(this.sessions, req);
    const issued = await this.signInService.completeMfa({ code: body.code, recoveryCode: body.recoveryCode });
    if (!issued) {
      await this.audit.record('mfa-failed', {
        userId: owner,
        client,
        details: { method: body.code ? 'totp' : 'recovery-code' },
      });
      throw new UnauthorizedException(INVALID_CODE);
    }
    const userId = issued.session.userId;
    await this.users.markSignedIn(userId);
    await this.audit.record('sign-in', {
      userId,
      client,
      details: { mfa: true, method: body.code ? 'totp' : 'recovery-code' },
    });
    return {
      ok: true,
      remainingRecoveryCodes: body.recoveryCode ? await this.mfa.remainingRecoveryCodes(userId) : undefined,
    };
  }

  /** A new batch of recovery codes; the old ones stop working. Needs a fresh code. */
  @Authenticate({ mfa: true })
  @Post('recovery-codes')
  @HttpCode(200)
  async regenerate(@CurrentUser('id') userId: string, @Body({ schema: codeSchema }) body: CodeDto, @Req() req: RequestLike) {
    if (!(await this.mfa.verifyTotp(userId, body.code))) {
      throw new UnauthorizedException(INVALID_CODE);
    }
    await this.audit.record('recovery-codes-regenerated', { userId, client: clientInfo(req) });
    return { recoveryCodes: await this.mfa.generateRecoveryCodes(userId) };
  }
}
