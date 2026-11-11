import { applyDecorators, ForbiddenException, Injectable, UseGuards, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Authenticate } from '@nestjs/authentication';
import { PANEL_ROLES, type User } from '../users/user.js';

/** Runs after the global authentication guard, which sets `request.user`. */
@Injectable()
export class PanelRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest<{ user?: User | null }>().user;
    if (!user || !PANEL_ROLES.includes(user.role)) {
      throw new ForbiddenException({ message: 'Bu alana erişim yetkiniz yok.', errorCode: 'forbidden' });
    }
    return true;
  }
}

/**
 * Every admin-panel route: a signed-in panel user whose session passed the
 * second factor.
 */
export const PanelAccess = () => applyDecorators(Authenticate({ mfa: true }), UseGuards(PanelRoleGuard));
