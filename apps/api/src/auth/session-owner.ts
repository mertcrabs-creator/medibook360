import type { SessionService } from '@nestjs/authentication';
import type { RequestLike } from '../audit/audit.service.js';

const COOKIE = '__Host-sid';

/**
 * The user id of the session in this request's cookie, pending or not, or
 * null. For the audit trail on public routes (sign-out, second factor),
 * where the guard sets no user.
 */
export async function sessionOwner(sessions: SessionService, req: RequestLike): Promise<string | null> {
  const header = req.headers.cookie;
  if (typeof header !== 'string') return null;
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === COOKIE) {
      const session = await sessions.validate(decodeURIComponent(rest.join('='))).catch(() => null);
      return session?.userId ?? null;
    }
  }
  return null;
}
