import { z } from 'zod';

const COMMON = [
  'password',
  'parola',
  'sifre',
  'şifre',
  '123456',
  'qwerty',
  'admin',
  'medibook',
  'letmein',
  'welcome',
];

/**
 * NIST 800-63B style: length over composition. At least 12 characters,
 * at most 128, not mostly one repeated character, and not built around a
 * well-known password.
 */
export const newPasswordSchema = z
  .string()
  .min(12, 'Şifre en az 12 karakter olmalı.')
  .max(128, 'Şifre en fazla 128 karakter olabilir.')
  .refine((value) => new Set(value).size >= 6, 'Şifre çok tekrarlı; daha çeşitli karakterler kullanın.')
  .refine(
    (value) => !COMMON.some((word) => value.toLowerCase().includes(word)),
    'Şifre yaygın bir kelime içeriyor.',
  );
