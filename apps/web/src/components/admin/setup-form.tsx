"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, Rocket, Terminal } from "lucide-react";
import { Alert, Field, PasswordInput, PasswordStrength, Spinner, TextInput, passwordChecks } from "@/components/admin/form";
import { Header } from "@/components/admin/login-form";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";

export function SetupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ setupToken: "", name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const strongEnough = passwordChecks(form.password, form.email).every((c) => c.ok);
  const mismatch = form.confirm.length > 0 && form.confirm !== form.password;
  const canSubmit =
    form.setupToken.trim() && form.name.trim().length >= 2 && form.email.includes("@") && strongEnough && !mismatch && form.confirm;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await api("/auth/setup", {
        body: {
          setupToken: form.setupToken.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        },
      });
      router.replace("/yonetim/iki-adimli-dogrulama");
    } catch (err) {
      if (err instanceof ApiError && err.code === "setup_done") {
        router.replace("/yonetim/giris");
        return;
      }
      setError(err instanceof ApiError ? err.message : "Beklenmeyen bir hata oluştu.");
      setBusy(false);
    }
  }

  return (
    <div>
      <Steps current={1} />
      <Header
        icon={<Rocket className="size-6" />}
        title="İlk kurulum"
        text="Paneli yönetecek ilk süper yönetici hesabını oluşturun. Bu ekran yalnızca hiç yönetici yokken açılır."
      />

      <div className="mt-6 flex gap-3 rounded-xl border border-line bg-surface-2/60 p-4 text-sm text-muted">
        <Terminal className="mt-0.5 size-4 shrink-0 text-cyan-600" aria-hidden />
        <p>
          <span className="font-semibold text-fg">Kurulum kodu</span> API&apos;nin başlatıldığı terminalde yazar
          (<code className="rounded bg-surface px-1 py-0.5 font-mono text-xs text-fg">XXXXX-XXXXX-XXXXX-XXXXX</code>). Böylece
          sunucuya erişimi olmayan biri paneli ele geçiremez.
        </p>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
        {error && <Alert>{error}</Alert>}
        <Field label="Kurulum kodu">
          {(p) => (
            <TextInput
              {...p}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              value={form.setupToken}
              onChange={set("setupToken")}
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
              className="font-mono uppercase tracking-wider"
            />
          )}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ad soyad">
            {(p) => <TextInput {...p} autoComplete="name" value={form.name} onChange={set("name")} placeholder="Adınız Soyadınız" />}
          </Field>
          <Field label="E-posta">
            {(p) => (
              <TextInput {...p} type="email" autoComplete="username" value={form.email} onChange={set("email")} placeholder="siz@medibook360.com" />
            )}
          </Field>
        </div>
        <Field label="Şifre">
          {(p) => (
            <>
              <PasswordInput {...p} autoComplete="new-password" value={form.password} onChange={set("password")} placeholder="En az 12 karakter" />
              <PasswordStrength password={form.password} email={form.email} />
            </>
          )}
        </Field>
        <Field label="Şifre (tekrar)" error={mismatch ? "Şifreler eşleşmiyor." : null}>
          {(p) => <PasswordInput {...p} autoComplete="new-password" value={form.confirm} onChange={set("confirm")} />}
        </Field>
        <button type="submit" disabled={busy || !canSubmit} className={buttonClass({ size: "lg", className: "w-full" })}>
          {busy ? <Spinner /> : null}
          {busy ? "Hesap oluşturuluyor…" : "Hesabı oluştur ve devam et"}
          {!busy && <ArrowRight className="size-4" />}
        </button>
      </form>
    </div>
  );
}

export function Steps({ current }: { current: 1 | 2 | 3 }) {
  const labels = ["Hesap", "2FA kurulumu", "Kurtarma kodları"];
  return (
    <ol className="mb-8 flex items-center gap-2" aria-label="Kurulum adımları">
      {labels.map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "active" : "todo";
        return (
          <li key={label} className="flex flex-1 flex-col gap-2" aria-current={state === "active" ? "step" : undefined}>
            <span
              className={
                state === "todo"
                  ? "h-1.5 rounded-full bg-line"
                  : "h-1.5 rounded-full bg-linear-to-r from-navy-600 to-cyan-400"
              }
            />
            <span className={state === "todo" ? "text-xs font-medium text-subtle" : "text-xs font-semibold text-fg"}>
              {n}. {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
