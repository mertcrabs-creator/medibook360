"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { Alert, Field, OtpInput, PasswordInput, Spinner, TextInput } from "@/components/admin/form";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";

type Step = "credentials" | "code" | "recovery";

export function LoginForm({ initialStep = "credentials", notice }: { initialStep?: Step; notice?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialStep);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitCredentials(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await api<{ mfaRequired: boolean; mfaEnrollmentRequired: boolean }>("/auth/sign-in", {
        body: { email, password },
      });
      setPassword("");
      if (result.mfaRequired) {
        setStep("code");
      } else if (result.mfaEnrollmentRequired) {
        router.replace("/yonetim/iki-adimli-dogrulama");
      } else {
        router.replace("/yonetim");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setBusy(false);
    }
  }

  async function submitSecondFactor(body: { code?: string; recoveryCode?: string }) {
    setBusy(true);
    setError(null);
    try {
      await api("/auth/mfa/verify", { body });
      router.replace("/yonetim");
      router.refresh();
    } catch (err) {
      setCode("");
      if (err instanceof ApiError && err.status === 401 && err.code !== "invalid_code") {
        // The pending session expired (10 minutes): start over.
        setStep("credentials");
        setError("Doğrulama süresi doldu. Lütfen yeniden giriş yapın.");
      } else {
        setError(err instanceof ApiError ? err.message : "Beklenmeyen bir hata oluştu.");
      }
      setBusy(false);
    }
  }

  async function backToStart() {
    setBusy(true);
    await api("/auth/sign-out", { method: "POST" }).catch(() => undefined);
    setBusy(false);
    setCode("");
    setError(null);
    setStep("credentials");
  }

  if (step === "credentials") {
    return (
      <div>
        <Header
          icon={<ShieldCheck className="size-6" />}
          title="Yönetici girişi"
          text="Devam etmek için kurumsal e-posta adresiniz ve şifrenizle giriş yapın."
        />
        <form onSubmit={submitCredentials} className="mt-8 space-y-5" noValidate>
          {notice && !error && <Alert tone="info">{notice}</Alert>}
          {error && <Alert>{error}</Alert>}
          <Field label="E-posta adresi">
            {(p) => (
              <TextInput
                {...p}
                type="email"
                autoComplete="username"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ad.soyad@medibook360.com"
              />
            )}
          </Field>
          <Field label="Şifre">
            {(p) => (
              <PasswordInput
                {...p}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            )}
          </Field>
          <button type="submit" disabled={busy || !email || !password} className={buttonClass({ size: "lg", className: "w-full" })}>
            {busy ? <Spinner /> : null}
            {busy ? "Kontrol ediliyor…" : "Devam et"}
            {!busy && <ArrowRight className="size-4" />}
          </button>
        </form>
        <p className="mt-8 text-center text-xs leading-relaxed text-subtle">
          Şifrenizi unuttuysanız sistem yöneticinizle iletişime geçin. Art arda hatalı denemeler geçici olarak engellenir.
        </p>
      </div>
    );
  }

  if (step === "recovery") {
    return (
      <div>
        <Header
          icon={<KeyRound className="size-6" />}
          title="Kurtarma kodu"
          text="Doğrulayıcı uygulamanıza erişemiyorsanız, kurulumda kaydettiğiniz kurtarma kodlarından birini girin. Her kod yalnızca bir kez kullanılabilir."
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitSecondFactor({ recoveryCode: recoveryCode.trim() });
          }}
          className="mt-8 space-y-5"
        >
          {error && <Alert>{error}</Alert>}
          <Field label="Kurtarma kodu">
            {(p) => (
              <TextInput
                {...p}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                placeholder="xxxxx-xxxxx"
                className="font-mono tracking-wider"
              />
            )}
          </Field>
          <button type="submit" disabled={busy || recoveryCode.trim().length < 4} className={buttonClass({ size: "lg", className: "w-full" })}>
            {busy && <Spinner />} Doğrula ve giriş yap
          </button>
        </form>
        <div className="mt-6 flex items-center justify-between text-sm">
          <button type="button" onClick={() => setStep("code")} className="font-medium text-muted hover:text-fg">
            Doğrulayıcı kodu kullan
          </button>
          <button type="button" onClick={backToStart} className="inline-flex items-center gap-1.5 font-medium text-muted hover:text-fg">
            <ArrowLeft className="size-4" /> Başa dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        icon={<Smartphone className="size-6" />}
        title="İki adımlı doğrulama"
        text="Doğrulayıcı uygulamanızdaki (Google Authenticator, Microsoft Authenticator, 1Password vb.) 6 haneli kodu girin."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length === 6) void submitSecondFactor({ code });
        }}
        className="mt-8 space-y-5"
      >
        {error && <Alert>{error}</Alert>}
        <OtpInput
          value={code}
          onChange={setCode}
          onComplete={(c) => void submitSecondFactor({ code: c })}
          disabled={busy}
          invalid={Boolean(error)}
          autoFocus
        />
        <button type="submit" disabled={busy || code.length !== 6} className={buttonClass({ size: "lg", className: "w-full" })}>
          {busy && <Spinner />} {busy ? "Doğrulanıyor…" : "Doğrula ve giriş yap"}
        </button>
      </form>
      <div className="mt-6 flex items-center justify-between text-sm">
        <button type="button" onClick={() => setStep("recovery")} className="font-medium text-navy-600 hover:text-navy-800 dark:text-cyan-300">
          Kurtarma kodu kullan
        </button>
        <button type="button" onClick={backToStart} className="inline-flex items-center gap-1.5 font-medium text-muted hover:text-fg">
          <ArrowLeft className="size-4" /> Başa dön
        </button>
      </div>
      <p className="mt-8 text-center text-xs text-subtle">5 hatalı denemeden sonra kod girişi 15 dakika kilitlenir.</p>
    </div>
  );
}

export function Header({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div>
      <span className="flex size-12 items-center justify-center rounded-2xl bg-navy-700 text-cyan-300 shadow-lift dark:bg-cyan-400/10 dark:ring-1 dark:ring-cyan-400/30">
        {icon}
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-fg">{title}</h1>
      <p className="mt-2 leading-relaxed text-muted">{text}</p>
    </div>
  );
}
