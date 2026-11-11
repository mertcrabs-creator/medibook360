import type { User } from '../users/user.js';

// Tells @nestjs/authentication what a user is, so @CurrentUser() and
// AuthenticationContext are typed across the app.
declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: User;
  }
}
