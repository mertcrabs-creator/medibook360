import type { UserRole, UserStatus } from '../generated/prisma/enums.js';

export type { UserRole, UserStatus };

/** A user as the rest of the app sees it: never carries the password hash. */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
}

/** Roles that may open the admin panel. */
export const PANEL_ROLES: readonly UserRole[] = ['SUPER_ADMIN', 'ADMIN'];

/** Trimmed, NFC-normalized and lowercased, as stored. */
export const normalizeEmail = (email: string) => email.trim().normalize('NFC').toLowerCase();
