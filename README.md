# MediBook360

Hastaları doktor, klinik ve hastanelerle buluşturan çok dilli sağlık platformu.

## Yapı

```
medibook360/
├─ apps/
│  ├─ web/        Next.js 16 (App Router) — kullanıcı arayüzü, SEO sayfaları
│  └─ api/        NestJS 12 — iş mantığı, kimlik doğrulama, Prisma 7 + PostgreSQL
├─ packages/      Ortak paketler (doğrulama şemaları, tipler) — ileride
├─ infra/         Docker servislerinin ayarları
├─ docs/          Mimari kararlar
└─ docker-compose.yml   PostgreSQL 18 + PostGIS, Valkey, Mailpit
```

Tarayıcı **yalnızca** web uygulamasıyla konuşur. `/api/*` istekleri Next.js tarafından
NestJS API'ye iletilir; API dışarıya açık değildir (sadece `127.0.0.1`).

## Gereksinimler

- Node.js 24+
- pnpm 12 (`npm i -g pnpm`)
- Docker Desktop (WSL2 ile)

## İlk kurulum

```bash
pnpm install          # bağımlılıklar + Prisma client üretimi
pnpm setup:env        # .env dosyasını rastgele güçlü şifrelerle oluşturur
pnpm services:up      # PostgreSQL, Valkey, Mailpit (Docker)
pnpm db:migrate       # veritabanı şemasını uygular
pnpm dev              # web: http://localhost:3000  api: http://localhost:4000
```

## Yönetim paneli (`/yonetim`)

İlk çalıştırmada hiç yönetici yoktur. API açılırken terminale tek kullanımlık bir
**kurulum kodu** yazar:

```
MediBook360 kurulumu bekliyor: henüz yönetici hesabı yok.
  1) Tarayıcıda açın:  http://localhost:3000/yonetim/kurulum
  2) Kurulum kodu:     XXXXX-XXXXX-XXXXX-XXXXX
```

1. `http://localhost:3000/yonetim/kurulum` → kurulum kodu, ad, e-posta, şifre (en az 12 karakter).
2. İki adımlı doğrulama kurulumu → QR kodu Google/Microsoft Authenticator, 1Password vb. ile okutun.
3. 10 kurtarma kodunu kaydedin → panele girilir.

Sonraki girişler: `http://localhost:3000/yonetim/giris` (şifre + 6 haneli kod).
Kod API her yeniden başladığında değişir ve ilk yönetici oluşunca devre dışı kalır.

Güvenlik özeti: scrypt şifre özeti · sunucu taraflı oturum (`__Host-sid`, HttpOnly,
Secure, SameSite=Strict, 12 saat mutlak / 30 dk hareketsizlik) · zorunlu TOTP 2FA
(gizli anahtarlar AES-256-GCM ile şifreli) · hesap+IP hız sınırı · CSRF ve oturum
sabitleme koruması · tüm olaylar `audit_logs` tablosunda.

## Faydalı adresler (lokal)

| Adres | Ne |
|---|---|
| http://localhost:3000 | Web uygulaması |
| http://localhost:3000/api/health/ready | API + veritabanı sağlık kontrolü |
| http://localhost:8025 | Mailpit — uygulamanın gönderdiği tüm e-postalar |
| `pnpm db:studio` | Prisma Studio — veritabanını tarayıcıda görüntüle |

## Komutlar

| Komut | Açıklama |
|---|---|
| `pnpm dev` | Web ve API'yi birlikte geliştirme modunda başlatır |
| `pnpm build` | Hepsini derler |
| `pnpm lint` / `pnpm typecheck` | Kod kalitesi kontrolleri |
| `pnpm test` | Testler |
| `pnpm services:up` / `services:down` | Docker servislerini aç/kapat |
| `pnpm db:migrate` | Şema değişikliğinden migration üretir ve uygular |

## Güvenlik notları

- `.env` asla repoya girmez. Şablon: `.env.example`.
- Paketlerin kurulum script'leri varsayılan olarak engellidir; izin verilenler
  `pnpm-workspace.yaml` içindeki `allowBuilds` listesindedir.
- Docker portları yalnızca `127.0.0.1`'e bağlıdır.
