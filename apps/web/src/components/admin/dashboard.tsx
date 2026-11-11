"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  Activity,
  ArrowRight,
  Building2,
  CalendarDays,
  ChartColumn,
  CircleCheck,
  Database,
  Hospital,
  KeyRound,
  LogIn,
  Megaphone,
  MonitorSmartphone,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  TriangleAlert,
  UserRound,
  Users,
} from "lucide-react";
import { AuditTimeline } from "@/components/admin/audit-list";
import { Card, CardHeader } from "@/components/admin/card";
import { Alert } from "@/components/admin/form";
import { useMe } from "@/components/admin/panel-shell";
import { CardSkeleton } from "@/components/admin/skeletons";
import { api, ApiError, type Overview } from "@/lib/api";
import { cn } from "@/lib/cn";
import { relativeTime, uptime } from "@/lib/format";

type Security = { mfaEnrolled: boolean; recoveryCodesLeft: number };

const noopSubscribe = () => () => {};
function clientGreeting() {
  const h = new Date().getHours();
  return h < 6 ? "İyi geceler" : h < 12 ? "Günaydın" : h < 18 ? "İyi günler" : "İyi akşamlar";
}
let todayCache = "";
function clientToday() {
  // useSyncExternalStore needs a stable value between calls.
  const value = new Intl.DateTimeFormat("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  if (value !== todayCache) todayCache = value;
  return todayCache;
}

export function Dashboard() {
  const me = useMe();
  const [data, setData] = useState<Overview | null>(null);
  const [security, setSecurity] = useState<Security | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // The visitor's clock, not the server's: the server snapshot is a neutral default.
  const greeting = useSyncExternalStore(noopSubscribe, clientGreeting, () => "Hoş geldiniz");
  const today = useSyncExternalStore(noopSubscribe, clientToday, () => "");

  // Every state update happens after the request resolves.
  const fetchAll = useCallback(
    () =>
      Promise.all([api<Overview>("/admin/overview"), api<Security>("/account/security")])
        .then(([overview, sec]) => {
          setData(overview);
          setSecurity(sec);
          setError(null);
        })
        .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Veriler yüklenemedi."))
        .finally(() => setLoading(false)),
    [],
  );

  const load = useCallback(() => {
    setLoading(true);
    void fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const firstName = me.user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-navy-700 via-navy-800 to-navy-950 px-6 py-7 text-white shadow-lift sm:px-8">
        <div aria-hidden className="bg-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
        <div aria-hidden className="absolute -right-16 -top-24 size-72 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-cyan-300">{today || " "}</p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {greeting}, {firstName} 👋
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-navy-100/75">
              MediBook360 yönetim paneline hoş geldiniz. Platform modülleri adım adım bu panele eklenecek; şimdilik
              güvenlik ve sistem durumunu buradan izleyebilirsiniz.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {me.user.lastLoginAt && (
              <p className="text-xs text-navy-100/60">Son giriş: {relativeTime(me.user.lastLoginAt)}</p>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15 disabled:opacity-60"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} /> Yenile
            </button>
          </div>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data ? (
          <>
            <Kpi icon={Users} label="Aktif yönetici" value={data.admins} hint="Panele erişimi olan hesaplar" />
            <Kpi icon={MonitorSmartphone} label="Açık oturum" value={data.activeSessions} hint="2FA doğrulanmış oturumlar" />
            <Kpi icon={LogIn} label="Giriş (24 saat)" value={data.signIns24h} hint="Başarılı panel girişleri" />
            <Kpi
              icon={data.failed24h > 0 ? ShieldAlert : ShieldCheck}
              label="Başarısız deneme (24 saat)"
              value={data.failed24h}
              hint={data.failed24h > 0 ? "Denetim kayıtlarını inceleyin" : "Şüpheli hareket yok"}
              tone={data.failed24h > 0 ? "danger" : "ok"}
            />
          </>
        ) : (
          Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} className="h-[132px]" />)
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Recent events */}
        <Card>
          <CardHeader
            icon={<Activity className="size-4.5" />}
            title="Son güvenlik olayları"
            description="Giriş, çıkış ve hesap değişiklikleri"
            action={
              <Link href="/yonetim/denetim-kayitlari" className="inline-flex items-center gap-1 text-sm font-semibold text-navy-600 hover:text-navy-800 dark:text-cyan-300">
                Tümü <ArrowRight className="size-4" />
              </Link>
            }
          />
          <div className="p-3 sm:p-4">{data ? <AuditTimeline items={data.recent} /> : <CardSkeleton className="h-72" />}</div>
        </Card>

        <div className="space-y-6">
          <SecurityScore security={security} />

          {/* System status */}
          <Card>
            <CardHeader icon={<Server className="size-4.5" />} title="Sistem durumu" />
            <ul className="divide-y divide-line">
              <StatusRow icon={Server} label="API" ok={Boolean(data)} detail={data ? `Çalışma süresi ${uptime(data.system.api.uptimeSeconds)} · Node ${data.system.api.node}` : "Kontrol ediliyor…"} />
              <StatusRow icon={Database} label="Veritabanı" ok={Boolean(data)} detail={data ? `PostgreSQL · ${data.system.database.latencyMs} ms` : "Kontrol ediliyor…"} />
            </ul>
          </Card>
        </div>
      </div>

      <Roadmap />
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: typeof Users;
  label: string;
  value: number;
  hint: string;
  tone?: "default" | "ok" | "danger";
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-lg",
            tone === "danger"
              ? "bg-danger/10 text-danger"
              : tone === "ok"
                ? "bg-success/10 text-success"
                : "bg-navy-50 text-navy-700 dark:bg-cyan-400/10 dark:text-cyan-300",
          )}
        >
          <Icon className="size-4.5" aria-hidden />
        </span>
      </div>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight text-fg">{value.toLocaleString("tr-TR")}</p>
      <p className={cn("mt-1 text-xs", tone === "danger" ? "font-medium text-danger" : "text-subtle")}>{hint}</p>
    </Card>
  );
}

function StatusRow({ icon: Icon, label, ok, detail }: { icon: typeof Server; label: string; ok: boolean; detail: string }) {
  return (
    <li className="flex items-center gap-3 px-5 py-4 sm:px-6">
      <Icon className="size-4.5 text-subtle" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-fg">{label}</p>
        <p className="truncate text-xs text-muted">{detail}</p>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
          ok ? "bg-success/10 text-success" : "bg-surface-2 text-subtle",
        )}
      >
        <span className={cn("size-1.5 rounded-full", ok ? "bg-success" : "bg-subtle")} />
        {ok ? "Çalışıyor" : "Bekleniyor"}
      </span>
    </li>
  );
}

function SecurityScore({ security }: { security: Security | null }) {
  const checks = security
    ? [
        { ok: security.mfaEnrolled, label: "İki adımlı doğrulama etkin" },
        { ok: security.recoveryCodesLeft >= 3, label: `Kurtarma kodu: ${security.recoveryCodesLeft}/10 kaldı` },
        { ok: true, label: "Oturum çerezi HttpOnly + Secure + SameSite=Strict" },
        { ok: true, label: "Hareketsizlikte 30 dk sonra otomatik çıkış" },
      ]
    : [];
  const score = checks.length ? Math.round((checks.filter((c) => c.ok).length / checks.length) * 100) : 0;
  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <Card>
      <CardHeader icon={<ShieldCheck className="size-4.5" />} title="Hesap güvenliği" />
      {security ? (
        <div className="flex items-center gap-5 p-5 sm:p-6">
          <div className="relative size-24 shrink-0">
            <svg viewBox="0 0 80 80" className="size-full -rotate-90">
              <circle cx="40" cy="40" r={R} fill="none" strokeWidth="8" className="stroke-line" />
              <circle
                cx="40"
                cy="40"
                r={R}
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - score / 100)}
                className={score === 100 ? "stroke-success" : "stroke-warning"}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-fg">{score}%</span>
          </div>
          <ul className="min-w-0 flex-1 space-y-2">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-2 text-sm">
                {c.ok ? (
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                ) : (
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                )}
                <span className={c.ok ? "text-muted" : "font-medium text-fg"}>{c.label}</span>
              </li>
            ))}
            {security.recoveryCodesLeft < 3 && (
              <li>
                <Link href="/yonetim/guvenlik" className="inline-flex items-center gap-1 text-sm font-semibold text-navy-600 dark:text-cyan-300">
                  <KeyRound className="size-4" /> Kodları yenile
                </Link>
              </li>
            )}
          </ul>
        </div>
      ) : (
        <div className="p-5">
          <CardSkeleton className="h-24" />
        </div>
      )}
    </Card>
  );
}

function Roadmap() {
  const modules = [
    { icon: CalendarDays, title: "Randevular", text: "Tüm randevuları izleme, iptal ve yeniden planlama" },
    { icon: Stethoscope, title: "Doktorlar", text: "Başvuru onayı, belge doğrulama, profil yönetimi" },
    { icon: Building2, title: "Klinikler", text: "Kurum kayıtları, şubeler ve hekim atamaları" },
    { icon: Hospital, title: "Hastaneler", text: "Bölümler, kurumsal hesaplar ve entegrasyonlar" },
    { icon: UserRound, title: "Hastalar", text: "Hesap desteği, KVKK talepleri ve engelleme" },
    { icon: Megaphone, title: "İçerik & Kampanyalar", text: "Sağlık rehberi, duyurular ve ana sayfa vitrinleri" },
    { icon: ChartColumn, title: "Raporlar", text: "Büyüme, dönüşüm ve gelir analizleri" },
  ];
  return (
    <Card>
      <CardHeader
        icon={<ChartColumn className="size-4.5" />}
        title="Planlanan modüller"
        description="Panel bölüm bölüm genişletilecek. Hangi modülün önce geleceğine birlikte karar vereceğiz."
      />
      <ul className="grid gap-px overflow-hidden rounded-b-2xl bg-line sm:grid-cols-2 xl:grid-cols-4">
        {modules.map((m) => (
          <li key={m.title} className="flex gap-3 bg-surface p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-dashed border-line-strong text-subtle">
              <m.icon className="size-4.5" aria-hidden />
            </span>
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-fg">
                {m.title}
                <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-subtle">Yakında</span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{m.text}</p>
            </div>
          </li>
        ))}
        <li className="flex items-center justify-center bg-surface p-5 text-center text-sm text-subtle">+ Sizin belirleyeceğiniz özellikler</li>
      </ul>
    </Card>
  );
}
