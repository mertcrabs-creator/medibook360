import { z } from 'zod';
import { newPasswordSchema } from './password-policy.js';

export const setupSchema = z.object({
  setupToken: z.string().trim().min(1).max(200),
  name: z.string().trim().min(2, 'Ad soyad en az 2 karakter olmalı.').max(100),
  email: z.email('Geçerli bir e-posta adresi girin.').max(254),
  password: newPasswordSchema,
});
export type SetupDto = z.infer<typeof setupSchema>;

export const signInSchema = z.object({
  email: z.string().max(254),
  password: z.string().max(256),
});
export type SignInDto = z.infer<typeof signInSchema>;

export const codeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Kod 6 haneli olmalı.'),
});
export type CodeDto = z.infer<typeof codeSchema>;

export const verifyMfaSchema = z
  .object({
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/)
      .optional(),
    recoveryCode: z.string().trim().min(4).max(64).optional(),
  })
  .refine((body) => Boolean(body.code) !== Boolean(body.recoveryCode), 'Bir doğrulama kodu ya da bir kurtarma kodu gönderin.');
export type VerifyMfaDto = z.infer<typeof verifyMfaSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().max(256),
  newPassword: newPasswordSchema,
});
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
