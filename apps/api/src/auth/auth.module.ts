import { Module } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository.js';
import { AccountController } from './account.controller.js';
import { AuthController } from './auth.controller.js';
import { CredentialsService } from './credentials.service.js';
import { MfaController } from './mfa.controller.js';
import { PanelRoleGuard } from './panel-access.guard.js';
import { PrismaAuthenticationStore } from './prisma-auth.store.js';
import { SessionAuth } from './session-auth.provider.js';
import { SetupService } from './setup.service.js';
import './auth-types.js';

@Module({
  controllers: [AuthController, MfaController, AccountController],
  providers: [
    PrismaAuthenticationStore,
    SessionAuth,
    UsersRepository,
    CredentialsService,
    SetupService,
    PanelRoleGuard,
  ],
  exports: [UsersRepository, PanelRoleGuard],
})
export class AuthModule {}
