import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import type { User } from '../users/user.js';
import { UsersRepository } from '../users/users.repository.js';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly users: UsersRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  hash(password: string): Promise<string> {
    return this.hasher.hash(password);
  }

  /**
   * The user, or `null` when the email or password is wrong, or the account
   * is disabled. An unknown email takes as long as a wrong password (the
   * hasher checks a dummy hash), so the answer reveals nothing.
   */
  async verify(email: string, password: string): Promise<User | null> {
    const found = await this.users.findCredentials(email);
    const valid = await this.hasher.verify(password, found?.passwordHash);
    if (!valid || !found?.passwordHash || found.user.status !== 'ACTIVE') {
      return null;
    }
    if (this.hasher.needsRehash(found.passwordHash)) {
      await this.users.updatePasswordHash(found.user.id, await this.hasher.hash(password));
    }
    return found.user;
  }

  /** Checks the current password of a signed-in user. */
  async verifyForUser(userId: string, password: string): Promise<boolean> {
    const hash = await this.users.getPasswordHash(userId);
    const valid = await this.hasher.verify(password, hash);
    return valid && Boolean(hash);
  }
}
