"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, use, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  ChartColumn,
  ChevronDown,
  ClipboardList,
  Hospital,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  ScrollText,
  Settings,
  ShieldCheck,
  Star,
  Stethoscope,
  Sun,
  Timer,
  UserRound,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { buttonClass } from "@/components/ui/button";
import { api, type Me } from "@/lib/api";
import { cn } from "@/lib/cn";

/* --- Current user, shared with every panel page ------------------------- */

const MeContext = createContext<Me | null>(null);
export function useMe(): Me {
  const me = use(MeContext);
  if (!me) throw new Error("useMe must be used inside PanelShell");
  return me;
}

/* --- Navigation --------------------------------------------------------- */

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; soon?: boolean };

const NAV: { title: string; items: NavItem[] }[] = [
  {
    title: "Genel",
    items: [{ href: "/yonetim", label: "Genel Bakış", icon: LayoutDashboard }],
  },
  {
    title: "Platform",
    items: [
      { href: "#", label: "Randevular", icon: CalendarDays, soon: true },
      { href: "#", label: "Doktorlar", icon: Stethoscope, soon: true },
      { href: "#", label: "Klinikler", icon: Building2, soon: true },
      { href: "#", label: "Hastaneler", icon: Hospital, soon: true },
      { href: "#", label: "Hastalar", icon: UserRound, soon: true },
      { href: "#", label: "Değerlendirmeler", icon: Star, soon: true },
      { href: "#", label: "İçerik & Kampanyalar", icon: Megaphone, soon: true },
      { href: "#", label: "Raporlar", icon: ChartColumn, soon: true },
    ],
  },
  {
    title: "Güvenlik",
    items: [
      { href: "/yonetim/guvenlik", label: "Hesap Güvenliği", icon: ShieldCheck },
      { href: "/yonetim/denetim-kayitlari", label: "Denetim Kayıtları", icon: ScrollText },
      { href: "#", label: "Sistem Ayarları", icon: Settings, soon: true },
    ],
  },
];

const TITLES: Record<string, string> = {
  "/yonetim": "Genel Bakış",
  "/yonetim/guvenlik": "Hesap Güvenliği",
  "/yonetim/denetim-kayitlari": "Denetim Kayıtları",
};

/* --- Idle sign-out (mirrors the API's 30-minute idle timeout) ----------- */

const IDLE_MS = 30 * 60 * 1000;
const WARN_MS = 2 * 60 * 1000;

function useIdleSignOut(onExpire: () => void) {
  const lastActivity = useRef(0);
  const [remaining, setRemaining] = useState(IDLE_MS);

  const touch = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  useEffect(() => {
    lastActivity.current = Date.now();
    let expired = false;
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    // Activity only counts once the server has seen a request; keep it in
    // step by pinging /auth/me at most once a minute while the user is active.
    let lastPing = Date.now();
    const onActivity = () => {
      touch();
      if (Date.now() - lastPing > 60_000) {
        lastPing = Date.now();
        void api("/auth/me").catch(() => undefined);
      }
    };
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    const timer = setInterval(() => {
      const left = IDLE_MS - (Date.now() - lastActivity.current);
      setRemaining(left);
      if (left <= 0 && !expired) {
        expired = true;
        onExpire();
      }
    }, 1000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearInterval(timer);
    };
  }, [onExpire, touch]);

  return { remaining, touch };
}

function formatClock(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* --- Shell -------------------------------------------------------------- */

export function PanelShell({ me, children }: { me: Me; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const signOut = useCallback(
    async (reason: "cikis" | "zaman-asimi" = "cikis") => {
      await api("/auth/sign-out", { method: "POST" }).catch(() => undefined);
      router.replace(`/yonetim/giris?neden=${reason}`);
      router.refresh();
    },
    [router],
  );

  const expire = useCallback(() => void signOut("zaman-asimi"), [signOut]);
  const { remaining, touch } = useIdleSignOut(expire);
  const warning = remaining <= WARN_MS;

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <MeContext value={me}>
      <div className="flex min-h-dvh">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-dvh w-68 shrink-0 flex-col bg-navy-950 lg:flex">
          <Sidebar pathname={pathname} />
        </aside>

        {/* Sidebar (mobile drawer) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button aria-label="Menüyü kapat" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" />
            <aside className="relative flex h-full w-72 flex-col bg-navy-950 shadow-lift">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Menüyü kapat"
                className="absolute right-3 top-4 flex size-9 items-center justify-center rounded-lg text-navy-200 hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
              <Sidebar pathname={pathname} onNavigate={closeMobile} />
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Menüyü aç"
              className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface text-fg lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="hidden text-xs font-medium text-subtle sm:block">Yönetim Paneli</p>
              <h1 className="truncate font-display text-lg font-semibold text-fg">{TITLES[pathname] ?? "Yönetim"}</h1>
            </div>

            <div
              title="Hareketsiz kalırsanız oturumunuz bu sürenin sonunda kapanır"
              className={cn(
                "hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums sm:flex",
                warning ? "border-warning/40 bg-warning/10 text-warning" : "border-line bg-surface text-muted",
              )}
            >
              <Timer className="size-3.5" aria-hidden />
              {formatClock(remaining)}
            </div>
            <ThemeToggle />
            <UserMenu me={me} onSignOut={() => void signOut()} />
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-7xl animate-fade-up">{children}</div>
          </main>
        </div>
      </div>

      {warning && (
        <div role="alertdialog" aria-modal="true" aria-labelledby="idle-title" className="fixed inset-0 z-60 flex items-center justify-center bg-navy-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-lift">
            <span className="flex size-11 items-center justify-center rounded-xl bg-warning/10 text-warning">
              <Timer className="size-5" />
            </span>
            <h2 id="idle-title" className="mt-4 font-display text-xl font-semibold text-fg">
              Oturumunuz kapanmak üzere
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Güvenliğiniz için hareketsiz oturumlar kapatılır. Kalan süre:{" "}
              <span className="font-semibold tabular-nums text-fg">{formatClock(remaining)}</span>
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => void signOut()} className={buttonClass({ variant: "secondary", className: "flex-1" })}>
                Çıkış yap
              </button>
              <button
                autoFocus
                onClick={() => {
                  touch();
                  void api("/auth/me").catch(() => expire());
                }}
                className={buttonClass({ className: "flex-1" })}
              >
                Oturumu sürdür
              </button>
            </div>
          </div>
        </div>
      )}
    </MeContext>
  );
}

function Sidebar({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex h-16 items-center px-6">
        <Link href="/yonetim" aria-label="Genel bakış" onClick={onNavigate}>
          <Logo tone="light" className="h-6" />
        </Link>
      </div>
      <nav aria-label="Panel menüsü" className="flex-1 space-y-7 overflow-y-auto px-3 py-4">
        {NAV.map((group) => (
          <div key={group.title}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-navy-300/60">{group.title}</p>
            <ul className="mt-2 space-y-0.5">
              {group.items.map((item) => {
                const active = !item.soon && pathname === item.href;
                if (item.soon) {
                  return (
                    <li key={item.label}>
                      <span
                        aria-disabled="true"
                        title="Bu modül sonraki aşamada eklenecek"
                        className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm text-navy-200/40"
                      >
                        <item.icon className="size-4.5" aria-hidden />
                        <span className="flex-1">{item.label}</span>
                        <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy-200/50">
                          Yakında
                        </span>
                      </span>
                    </li>
                  );
                }
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                        active ? "bg-white/8 text-white" : "text-navy-100/75 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      {active && <span aria-hidden className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-cyan-400" />}
                      <item.icon className={cn("size-4.5", active ? "text-cyan-400" : "text-navy-300/70 group-hover:text-cyan-300")} aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="m-3 rounded-2xl bg-linear-to-br from-white/7 to-white/2 p-4 ring-1 ring-white/10">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <ShieldCheck className="size-4 text-cyan-400" /> Korumalı oturum
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-navy-200/60">2FA doğrulandı · Tüm işlemler denetim kaydına yazılır.</p>
      </div>
    </>
  );
}

// The theme lives on <html data-theme>, set before paint by the root layout.
function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const readTheme = () => (document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");

function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "light");
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => {
        document.documentElement.setAttribute("data-theme", next);
        try {
          localStorage.setItem("mb360-theme", next);
        } catch {}
      }}
      aria-label={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
      className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:text-fg"
    >
      {theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
    </button>
  );
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toLocaleUpperCase("tr"))
    .join("");
}

const ROLE_LABEL = { SUPER_ADMIN: "Süper Yönetici", ADMIN: "Yönetici" } as const;

function UserMenu({ me, onSignOut }: { me: Me; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-xl border border-transparent py-1 pl-1 pr-2 transition hover:border-line hover:bg-surface"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-linear-to-br from-navy-600 to-navy-800 font-display text-sm font-semibold text-cyan-300">
          {initials(me.user.name)}
        </span>
        <span className="hidden text-left md:block">
          <span className="block max-w-36 truncate text-sm font-semibold text-fg">{me.user.name}</span>
          <span className="block text-xs text-subtle">{ROLE_LABEL[me.user.role]}</span>
        </span>
        <ChevronDown className="hidden size-4 text-subtle md:block" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-lift">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-fg">{me.user.name}</p>
            <p className="truncate text-xs text-muted">{me.user.email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <Link role="menuitem" href="/yonetim/guvenlik" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-fg hover:bg-surface-2">
            <ShieldCheck className="size-4 text-muted" /> Hesap güvenliği
          </Link>
          <Link role="menuitem" href="/yonetim/denetim-kayitlari" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-fg hover:bg-surface-2">
            <ClipboardList className="size-4 text-muted" /> Denetim kayıtları
          </Link>
          <div className="my-1 h-px bg-line" />
          <button role="menuitem" onClick={onSignOut} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-danger hover:bg-danger/[0.07]">
            <LogOut className="size-4" /> Güvenli çıkış
          </button>
        </div>
      )}
    </div>
  );
}
