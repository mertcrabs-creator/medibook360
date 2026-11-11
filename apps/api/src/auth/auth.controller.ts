import { Body, Controller, Get, HttpCode, Post, Req, UnauthorizedException } from '@nestjs/common';
import {
  CurrentSession,
  CurrentUser,
  MfaService,
  Public,
  SessionService,
  SignInService,
  type SessionRecord,
} from '@nestjs/authentication';
import { Throttle, minutes } from '@nestjs/throttler';
import { AuditService, clientInfo, type RequestLike } from '../audit/audit.service.js';
import { normalizeEmail, PANEL_ROLES, type User } from '../users/user.js';
import { UsersRepository } from '../users/users.repository.js';
import { setupSchema, signInSchema, type SetupDto, type SignInDto } from './auth.schemas.js';
import { CredentialsService } from './credentials.service.js';
import { sessionOwner } from './session-owner.js';
import { SetupService } from './setup.service.js';

const INVALID_CREDENTIALS = { message: 'E-posta veya şifre hatalı.', errorCode: 'invalid_credentials' };

@Controller('auth')
export class AuthController {
  constructor(
    private readonly setup: SetupService,
    private readonly credentials: CredentialsService,
    private readonly signInService: SignInService,
    private readonly mfa: MfaService,
    private readonly users: UsersRepository,
    private readonly audit: AuditService,
    private readonly sessions: SessionService,
  ) {}

  /** Whether the first admin still has to be created. */
  @Public()
  @Get('setup')
  async setupStatus() {
    return { required: await this.setup.isRequired() };
  }

  @Public()
  @Post('setup')
  @Throttle({ default: { limit: 10, ttl: minutes(15) }, account: { limit: 5, ttl: minutes(15) } })
  async completeSetup(@Body({ schema: setupSchema }) body: SetupDto, @Req() req: RequestLike) {
    const user = await this.setup.complete(body);
    const client = clientInfo(req);
    await this.signInService.signIn(user.id, { method: 'password' });
    await this.users.markSignedIn(user.id);
    await this.audit.record('setup-completed', { userId: user.id, client });
    // No authenticator yet: the panel sends the new admin to 2FA setup next.
    return { next: 'mfa-enroll' as const };
  }

  @Public()
  @Post('sign-in')
  @HttpCode(200)
  @Throttle({ default: { limit: 30, ttl: minutes(15) }, account: { limit: 5, ttl: minutes(15) } })
  async signIn(@Body({ schema: signInSchema }) body: SignInDto, @Req() req: RequestLike) {
    const client = clientInfo(req);
    const user = await this.credentials.verify(body.email, body.password);
    if (!user || !PANEL_ROLES.includes(user.role)) {
      await this.audit.record('sign-in-failed', {
        userId: user?.id ?? null,
        client,
        details: { email: normalizeEmail(body.email).slice(0, 254) },
      });
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    const { session } = await this.signInService.signIn(user.id, { method: 'password' });
    const mfaRequired = session.mfa === 'pending';
    if (!mfaRequired) {
      await this.users.markSignedIn(user.id);
      await this.audit.record('sign-in', { userId: user.id, client, details: { mfa: false } });
    }
    return {
      mfaRequired,
      // Panel users must have an authenticator: the panel enrolls them first.
      mfaEnrollmentRequired: !mfaRequired && !(await this.mfa.isEnrolled(user.id)),
    };
  }

  /**
   * The signed-in user and the state of their second factor. Answers 401
   * `mfa_required` for a session still waiting for its code.
   */
  @Get('me')
  async me(@CurrentUser() user: User, @CurrentSession() session: SessionRecord) {
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, lastLoginAt: user.lastLoginAt },
      mfa: {
        enrolled: await this.mfa.isEnrolled(user.id),
        verified: session?.mfa === 'verified',
      },
      session: { expiresAt: session?.expiresAt ?? null },
    };
  }

  // Public, so a session still waiting for its second factor can sign out too.
  @Public()
  @Post('sign-out')
  @HttpCode(204)
  async signOut(@Req() req: RequestLike) {
    const userId = await sessionOwner(this.sessions, req);
    if (await this.signInService.signOut()) {
      await this.audit.record('sign-out', { userId, client: clientInfo(req) });
    }
  }
}
