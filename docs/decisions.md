# Mimari kararlar

Her karar: ne seçildi, neden, ve neyi açık bıraktık.

## 001 — Monorepo: Turborepo + pnpm
Web ve API ayrı uygulamalar; ileride mobil eklenince aynı API kullanılacak.
pnpm, kurulum script'lerini varsayılan olarak engellediği için tedarik zinciri
saldırılarına karşı daha güvenli.

## 002 — Web ↔ API iletişimi: Next.js rewrite (aynı origin)
Tarayıcı sadece `localhost:3000` (canlıda alan adımız) ile konuşur, `/api/*`
NestJS'e iletilir. Böylece oturum çerezleri birinci taraf (`__Host-` önekli)
kalır, CORS yüzeyi neredeyse sıfırdır ve API internete doğrudan açılmaz.

## 003 — Güvenlik başlıkları ve CSRF: NestJS yerleşik
NestJS 12'nin `app.useSecurityHeaders()` (helmet eşdeğeri) ve
`app.enableCsrfProtection()` (Fetch Metadata tabanlı) kullanılıyor. Ek paket yok.

## 004 — Kimlik doğrulama: `@nestjs/authentication` (planlandı)
Resmi NestJS paketi: scrypt şifre hash'i, `__Host-sid` HttpOnly çerez, token'lar
yalnızca SHA-256 hash olarak saklanır, TOTP 2FA (sırlar AES-256-GCM ile şifreli),
e-posta doğrulama, şifre sıfırlama, Google ile giriş. Oturum verileri Prisma
üzerinden PostgreSQL'de tutulacak (store arayüzlerini biz yazacağız).
**Açık:** Passkey/WebAuthn bu pakette yok; gerekirse ayrıca eklenecek.

## 005 — Veritabanı: PostgreSQL 18 + PostGIS, Prisma 7
Prisma 7 driver adapter (`@prisma/adapter-pg`) ile. Prisma CLI'nın `latest`
etiketi 8.0 RC'yi gösterdiği için kararlı 7.x sabitlendi.
Kurulu uzantılar: pgcrypto, citext, pg_trgm, unaccent, postgis.
**Açık:** Row Level Security ve ayrı (sahip olmayan) uygulama veritabanı rolü,
ilk tablolarla birlikte kurulacak.

## 006 — Web CSP
Script dışındaki tüm CSP kuralları aktif (frame-ancestors none, object-src none…).
**Açık:** `script-src` şimdilik `'unsafe-inline'` içeriyor. Nonce tabanlı CSP tüm
sayfaları dinamik render'a zorlar ve önbelleklemeyi kapatır; SRI deneysel.
Gerçek sayfalar oluşunca hangisinin seçileceğine karar verilecek.

## 007 — Yönetim paneli kimlik doğrulaması
`@nestjs/authentication` (004) devreye alındı; oturumlar ve 2FA durumu Prisma ile
PostgreSQL'de (`PrismaAuthenticationStore`, paketin store sözleşmesine göre: tek
seferlik işlemler tek koşullu SQL ifadesi).
- Panel adresi `/yonetim`. Panel API'leri `@PanelAccess()` = 2FA doğrulanmış oturum + rol
  (`SUPER_ADMIN`/`ADMIN`). Next.js tarafı hem proxy'de (çerez yoksa giriş) hem layout'ta
  (API'ye `/auth/me` sorar) kontrol eder; asıl karar her zaman API'de.
- İlk yönetici, API konsoluna yazılan tek kullanımlık kurulum koduyla oluşturulur
  (sunucuya erişimi olmayan biri paneli ele geçiremez). Eşzamanlı kurulum PostgreSQL
  advisory lock ile tek'e indirilir.
- 2FA yöneticiler için zorunlu; etkinleştirilince şifreyle açılmış diğer oturumlar kapanır.
- Oturum: 12 saat mutlak, 30 dk hareketsizlik; çerez `SameSite=Strict`.
- `audit_logs`: giriş/çıkış, başarısız denemeler, 2FA ve şifre değişiklikleri (IP + UA).
**Açık:** Throttler sayaçları şimdilik bellekte; çok sunuculu kurulumda Valkey'e taşınacak.
Yeni yönetici ekleme / rol yönetimi ekranı henüz yok. `TOTP_ENCRYPTION_KEY` kaybolursa
tüm doğrulayıcılar yeniden kurulmalı: üretimde secret manager'da tutulmalı.
