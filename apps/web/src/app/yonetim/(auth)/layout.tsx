import { Fingerprint, History, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const POINTS = [
  { icon: LockKeyhole, title: "Sunucu taraflı oturumlar", text: "HttpOnly, Secure, SameSite=Strict çerez; 30 dk hareketsizlikte otomatik çıkış." },
  { icon: Fingerprint, title: "Zorunlu iki adımlı doğrulama", text: "Her girişte şifreye ek olarak doğrulayıcı uygulama kodu istenir." },
  { icon: History, title: "Denetim kaydı", text: "Başarılı ve başarısız tüm girişler IP ve cihaz bilgisiyle kaydedilir." },
];

export default function AdminAuthLayout({ children }: LayoutProps<"/yonetim">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-navy-950 p-12 text-white lg:flex lg:flex-col">
        <div aria-hidden className="bg-grid absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_75%)]" />
        <div aria-hidden className="absolute -bottom-40 -right-40 size-[520px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div aria-hidden className="absolute -left-20 top-1/3 size-72 rounded-full bg-navy-500/30 blur-3xl" />

        <div className="relative">
          <Logo tone="light" className="h-8" priority />
        </div>

        <div className="relative mt-auto max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-300 ring-1 ring-white/15">
            <ShieldCheck className="size-3.5" aria-hidden /> Yetkili personel alanı
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight">
            Yönetim paneline
            <br />
            <span className="text-cyan-400">güvenli</span> giriş.
          </h1>
          <ul className="mt-10 space-y-6">
            {POINTS.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-cyan-300 ring-1 ring-white/10">
                  <p.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold text-white">{p.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-navy-100/70">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-14 text-xs text-navy-200/60">
          Bu sistem yalnızca yetkili MediBook360 personeli içindir. Yetkisiz erişim girişimleri kayıt altına alınır.
        </p>
      </aside>

      {/* Form side */}
      <main className="relative flex flex-col bg-bg">
        <div aria-hidden className="absolute inset-x-0 top-0 h-64 bg-linear-to-b from-cyan-50/70 to-transparent dark:from-cyan-400/[0.04]" />
        <div className="relative flex items-center justify-between px-6 py-6 sm:px-10">
          <Logo tone="auto" className="h-7 lg:invisible" />
          <Link href="/" className="text-sm font-medium text-muted hover:text-fg">
            Siteye dön
          </Link>
        </div>
        <div className="relative flex flex-1 items-center justify-center px-6 pb-16 sm:px-10">
          <div className="w-full max-w-md animate-fade-up">{children}</div>
        </div>
      </main>
    </div>
  );
}
