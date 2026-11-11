"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { KeyRound, Laptop, LockKeyhole, LogOut, MonitorSmartphone, ShieldCheck, Smartphone } from "lucide-react";
import { Card, CardHeader } from "@/components/admin/card";
import { Alert, Field, OtpInput, PasswordInput, PasswordStrength, Spinner, passwordChecks } from "@/components/admin/form";
import { RecoveryCodes } from "@/components/admin/mfa-enroll";
import { useMe } from "@/components/admin/panel-shell";
import { CardSkeleton } from "@/components/admin/skeletons";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError, type SessionInfo } from "@/lib/api";
import { cn } from "@/lib/cn";
import { dateTime, describeAgent, relativeTime } from "@/lib/format";

export function SecurityPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <div className="space-y-6">
        <SessionsCard />
        <PasswordCard />
      </div>
      <div className="space-y-6">
        <TwoFactorCard />
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-2 font-display font-semibold text-fg">
            <LockKeyhole className="size-4.5 text-cyan-600" /> Bu panel nasıl korunuyor?
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            {[
              "Şifreler scrypt (OWASP parametreleri) ile özetlenir, düz metin saklanmaz.",
              "Oturum anahtarının yalnızca SHA-256 özeti veritabanında tutulur.",
              "2FA anahtarları AES-256-GCM ile şifrelenmiş olarak saklanır.",
              "Hesap ve IP başına hız sınırı; 5 hatalı 2FA kodunda 15 dk kilit.",
              "Başka sitelerden gelen istekler (CSRF) ve oturum sabitleme engellenir.",
              "Her giriş, çıkış ve hesap değişikliği denetim kaydına yazılır.",
            ].map((line) => (
              <li key={line} className="flex gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* --- Sessions ------------------------------------------------------------ */

function SessionsCard() {
  const [sessions, setSessions] = useState<SessionInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const load = useCallback(
    () =>
      api<SessionInfo[]>("/account/sessions").then(setSessions, (err: unknown) =>
        setError(err instanceof ApiError ? err.message : "Oturumlar yüklenemedi."),
      ),
    [],
  );
  useEffect(() => {
    void load();
  }, [load]);

  async function revoke(id: string) {
    setPending(id);
    setError(null);
    try {
      await api(`/account/sessions/${encodeURIComponent(id)}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Oturum sonlandırılamadı.");
    } finally {
      setPending(null);
    }
  }

  async function revokeOthers() {
    setPending("others");
    setError(null);
    try {
      await api("/account/sessions/revoke-others", { method: "POST" });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "İşlem başarısız.");
    } finally {
      setPending(null);
    }
  }

  const others = sessions?.filter((s) => !s.current).length ?? 0;

  return (
    <Card>
      <CardHeader
        icon={<MonitorSmartphone className="size-4.5" />}
        title="Aktif oturumlar"
        description="Hesabınızın açık olduğu cihazlar. Tanımadığınız bir oturumu hemen sonlandırın."
        action={
          others > 0 ? (
            <button onClick={revokeOthers} disabled={pending !== null} className={buttonClass({ variant: "secondary", size: "sm" })}>
              {pending === "others" ? <Spinner /> : <LogOut className="size-4" />} Diğerlerini kapat
            </button>
          ) : null
        }
      />
      <div className="p-3 sm:p-4">
        {error && (
          <div className="mb-3">
            <Alert>{error}</Alert>
          </div>
        )}
        {!sessions ? (
          <CardSkeleton className="h-32" />
        ) : (
          <ul className="space-y-1">
            {sessions.map((s) => {
              const agent = describeAgent(s.userAgent);
              const Icon = agent.mobile ? Smartphone : Laptop;
              return (
                <li key={s.id} className={cn("flex items-center gap-4 rounded-xl px-3 py-3", s.current && "bg-cyan-400/[0.06] ring-1 ring-cyan-400/20")}>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
                      {agent.browser} · {agent.os}
                      {s.current && (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">Bu cihaz</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted" title={`Açılış: ${dateTime(s.createdAt)} · Bitiş: ${dateTime(s.expiresAt)}`}>
                      {s.ip ?? "IP bilinmiyor"} · Son etkinlik {relativeTime(s.lastActiveAt)} · Açılış {dateTime(s.createdAt)}
                    </p>
                  </div>
                  {!s.current && (
                    <button
                      onClick={() => void revoke(s.id)}
                      disabled={pending !== null}
                      className={buttonClass({ variant: "ghost", size: "sm", className: "text-danger hover:bg-danger/[0.07] hover:text-danger" })}
                    >
                      {pending === s.id ? <Spinner /> : <LogOut className="size-4" />} Sonlandır
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}

/* --- Password ------------------------------------------------------------- */

function PasswordCard() {
  const me = useMe();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const strong = passwordChecks(form.next, me.user.email).every((c) => c.ok);
  const mismatch = form.confirm.length > 0 && form.confirm !== form.next;
  const canSubmit = form.current && strong && form.confirm === form.next;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      await api("/account/password", { body: { currentPassword: form.current, newPassword: form.next } });
      setForm({ current: "", next: "", confirm: "" });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Şifre değiştirilemedi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader
        icon={<KeyRound className="size-4.5" />}
        title="Şifreyi değiştir"
        description="Değişiklikten sonra diğer tüm cihazlardaki oturumlarınız kapatılır."
      />
      <form onSubmit={submit} className="space-y-5 p-5 sm:p-6" noValidate>
        {error && <Alert>{error}</Alert>}
        {done && <Alert tone="success">Şifreniz güncellendi. Diğer oturumlarınız kapatıldı.</Alert>}
        <Field label="Mevcut şifre">
          {(p) => <PasswordInput {...p} autoComplete="current-password" value={form.current} onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))} />}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Yeni şifre">
            {(p) => <PasswordInput {...p} autoComplete="new-password" value={form.next} onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))} />}
          </Field>
          <Field label="Yeni şifre (tekrar)" error={mismatch ? "Şifreler eşleşmiyor." : null}>
            {(p) => <PasswordInput {...p} autoComplete="new-password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} />}
          </Field>
        </div>
        {form.next && <PasswordStrength password={form.next} email={me.user.email} />}
        <div className="flex justify-end">
          <button type="submit" disabled={busy || !canSubmit} className={buttonClass()}>
            {busy && <Spinner />} Şifreyi güncelle
          </button>
        </div>
      </form>
    </Card>
  );
}

/* --- Two-factor ------------------------------------------------------------ */

function TwoFactorCard() {
  const me = useMe();
  const [left, setLeft] = useState<number | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);

  useEffect(() => {
    api<{ recoveryCodesLeft: number }>("/account/security")
      .then((r) => setLeft(r.recoveryCodesLeft))
      .catch(() => setLeft(null));
  }, [codes]);

  async function regenerate(value: string) {
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ recoveryCodes: string[] }>("/auth/mfa/recovery-codes", { body: { code: value } });
      setCodes(r.recoveryCodes);
      setRegenerating(false);
      setCode("");
    } catch (err) {
      setCode("");
      setError(err instanceof ApiError ? err.message : "İşlem başarısız.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader icon={<Smartphone className="size-4.5" />} title="İki adımlı doğrulama" />
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 rounded-xl bg-success/[0.07] px-4 py-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-success" />
            <div>
              <p className="text-sm font-semibold text-fg">Doğrulayıcı uygulama</p>
              <p className="text-xs text-muted">Yönetici hesapları için zorunlu</p>
            </div>
          </div>
          <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">Etkin</span>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-fg">Kurtarma kodları</p>
              <p className="text-xs text-muted">
                {left === null ? "…" : `${left} kullanılmamış kod kaldı.`} Telefonunuza erişemezseniz bunlarla giriş yaparsınız.
              </p>
            </div>
            {!regenerating && (
              <button
                onClick={() => {
                  setRegenerating(true);
                  setCodes(null);
                  setError(null);
                }}
                className={buttonClass({ variant: "secondary", size: "sm" })}
              >
                Yenile
              </button>
            )}
          </div>
          {left !== null && left < 3 && !codes && (
            <div className="mt-3">
              <Alert tone="warning">Kurtarma kodlarınız azaldı. Yeni kodlar oluşturmanızı öneririz.</Alert>
            </div>
          )}
        </div>

        {regenerating && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (code.length === 6) void regenerate(code);
            }}
            className="space-y-4 rounded-xl border border-line p-4"
          >
            <p className="text-sm text-muted">
              Onaylamak için doğrulayıcı uygulamanızdaki kodu girin. <span className="font-semibold text-fg">Eski kodlar geçersiz olacak.</span>
            </p>
            {error && <Alert>{error}</Alert>}
            <OtpInput value={code} onChange={setCode} onComplete={(c) => void regenerate(c)} disabled={busy} invalid={Boolean(error)} autoFocus />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRegenerating(false)} className={buttonClass({ variant: "ghost", size: "sm" })}>
                Vazgeç
              </button>
              <button type="submit" disabled={busy || code.length !== 6} className={buttonClass({ size: "sm" })}>
                {busy && <Spinner />} Yeni kodlar oluştur
              </button>
            </div>
          </form>
        )}

        {codes && (
          <div className="space-y-3">
            <Alert tone="success">Yeni kurtarma kodlarınız oluşturuldu. Yalnızca şimdi gösteriliyor.</Alert>
            <RecoveryCodes codes={codes} email={me.user.email} />
          </div>
        )}
      </div>
    </Card>
  );
}
