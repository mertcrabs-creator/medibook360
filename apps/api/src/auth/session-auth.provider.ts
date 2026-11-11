import { Injectable } from '@nestjs/common';
import { AuthenticationRegistry, SessionCookieProvider, type SessionRecord } from '@nestjs/authentication';
import type { User } from '../users/user.js';
import { UsersRepository } from '../users/users.repository.js';

@Injectable()
export class SessionAuth extends SessionCookieProvider<User> {
  constructor(
    private readonly users: UsersRepository,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerProvider(this);
  }

  // Runs on every request with a live session cookie. A deleted or disabled
  // user loses access immediately: returning null ends the session.
  async validate(session: SessionRecord) {
    const user = await this.users.findById(session.userId);
    return user?.status === 'ACTIVE' ? user : null;
  }
}
