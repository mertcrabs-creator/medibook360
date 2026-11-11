"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { encode } from "uqr";
import { ArrowRight, Check, Copy, Download, KeyRound, QrCode, ScanLine, ShieldCheck } from "lucide-react";
import { Alert, OtpInput, Spinner } from "@/components/admin/form";
import { Header } from "@/components/admin/login-form";
import { Steps } from "@/components/admin/setup-form";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";

/** Renders a QR code as plain SVG rects: no HTML injection, crisp at any size. */
export function QrSvg({ value, className }: { value: string; className?: string }) {
  const qr = useMemo(() => encode(value, { ecc: "M", border: 2 }), [value]);
  const path = useMemo(() => {
    let d = "";
    qr.data.forEach((row, y) =>
      row.forEach((on, x) => {
        if (on) d += `M${x} ${y}h1v1h-1z`;
      }),
    );
    return d;
  }, [qr]);
  return (
    <svg viewBox={`0 0 ${qr.size} ${qr.size}`} shapeRendering="crispEdges" role="img" aria-label="Doğrulayıcı uygulama için QR kodu" className={className}>
      <rect width={qr.size} height={qr.size} fill="#fff" />
      <path d={path} fill="#003C56" />
    </svg>
  );
}

export function CopyButton({ text, label = "Kopyala" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text).catch(() => undefined);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className={buttonClass({ variant: "secondary", size: "sm" })}
    >
      {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
      {copied ? "Kopyalandı" : label}
    </button>
  );
}

export function RecoveryCodes({ codes, email }: { codes: string[]; email: string }) {
  const content = [
    "MediBook360 Yönetim Paneli — Kurtarma Kodları",
    `Hesap: ${email}`,
    "",
    ...codes,
    "",
    "Her kod yalnızca bir kez kullanılabilir. Bu dosyayı güvenli bir yerde (ör. şifre yöneticisi) saklayın.",
  ].join("\n");

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-line bg-surface-2/60 p-4">
        {codes.map((code, i) => (
          <code key={code} className="rounded-lg bg-surface px-3 py-2 text-center font-mono text-sm tracking-wider text-fg ring-1 ring-line">
            <span className="mr-2 text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
            {code}
          </code>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <CopyButton text={codes.join("\n")} label="Tümünü kopyala" />
        <button
          type="button"
          onClick={() => {
            const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
            const a = Object.assign(document.createElement("a"), { href: url, download: "medibook360-kurtarma-kodlari.txt" });
            a.click();
            URL.revokeObjectURL(url);
          }}
          className={buttonClass({ variant: "secondary", size: "sm" })}
        >
          <Download className="size-4" /> İndir (.txt)
        </button>
      </div>
    </div>
  );
}

export function MfaEnroll({ email }: { email: string }) {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<{ secret: string; uri: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api<{ secret: string; uri: string }>("/auth/mfa/enroll", { method: "POST" })
      .then((r) => !cancelled && setEnrollment(r))
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.code === "mfa_enrolled") router.replace("/yonetim");
        else if (err instanceof ApiError && err.status === 401) router.replace("/yonetim/giris");
        else setLoadError(err instanceof ApiError ? err.message : "Kurulum başlatılamadı.");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function confirm(value: string) {
    setBusy(true);
    setError(null);
    try {
      const result = await api<{ recoveryCodes: string[] }>("/auth/mfa/confirm", { body: { code: value } });
      setCodes(result.recoveryCodes);
    } catch (err) {
      setCode("");
      setError(err instanceof ApiError ? err.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setBusy(false);
    }
  }

  if (codes) {
    return (
      <div>
        <Steps current={3} />
        <Header
          icon={<KeyRound className="size-6" />}
          title="Kurtarma kodlarınız"
          text="Telefonunuzu kaybederseniz bu kodlarla giriş yapabilirsiniz. Kodlar yalnızca şimdi gösterilir; güvenli bir yere kaydedin."
        />
        <div className="mt-6">
          <Alert tone="success">İki adımlı doğrulama etkinleştirildi. Diğer tüm oturumlarınız güvenlik için kapatıldı.</Alert>
        </div>
        <div className="mt-5">
          <RecoveryCodes codes={codes} email={email} />
        </div>
        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 text-sm text-fg">
          <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-0.5 size-4 accent-cyan-500" />
          Kurtarma kodlarımı güvenli bir yere kaydettim.
        </label>
        <button
          type="button"
          disabled={!saved}
          onClick={() => {
            router.replace("/yonetim");
            router.refresh();
          }}
          className={buttonClass({ size: "lg", className: "mt-5 w-full" })}
        >
          Panele git <ArrowRight className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <Steps current={2} />
      <Header
        icon={<ShieldCheck className="size-6" />}
        title="İki adımlı doğrulamayı kurun"
        text="Yönetim paneli için zorunludur. Telefonunuzdaki doğrulayıcı uygulamayla aşağıdaki QR kodu okutun."
      />

      {loadError && (
        <div className="mt-6">
          <Alert>{loadError}</Alert>
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-[auto_1fr]">
        <div className="mx-auto flex size-48 items-center justify-center rounded-2xl border border-line bg-white p-3 shadow-soft">
          {enrollment ? <QrSvg value={enrollment.uri} className="size-full" /> : <Spinner className="size-6 text-subtle" />}
        </div>
        <ol className="space-y-3 text-sm text-muted">
          <li className="flex gap-3">
            <Bullet n={1} />
            <span>
              <span className="font-semibold text-fg">Google Authenticator</span>, Microsoft Authenticator veya 1Password gibi bir
              uygulamayı açın.
            </span>
          </li>
          <li className="flex gap-3">
            <Bullet n={2} />
            <span>
              <ScanLine className="mr-1 inline size-4 text-cyan-600" aria-hidden />
              QR kodu okutun ya da anahtarı elle girin.
            </span>
          </li>
          <li className="flex gap-3">
            <Bullet n={3} />
            <span>Uygulamanın gösterdiği 6 haneli kodu aşağıya yazın.</span>
          </li>
        </ol>
      </div>

      {enrollment && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowSecret((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-navy-800 dark:text-cyan-300"
          >
            <QrCode className="size-4" /> {showSecret ? "Anahtarı gizle" : "QR okutamıyor musunuz? Anahtarı göster"}
          </button>
          {showSecret && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface-2/60 p-3">
              <code className="flex-1 break-all font-mono text-sm tracking-wider text-fg">
                {enrollment.secret.replace(/(.{4})/g, "$1 ").trim()}
              </code>
              <CopyButton text={enrollment.secret} />
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length === 6) void confirm(code);
        }}
        className="mt-6 space-y-4"
      >
        {error && <Alert>{error}</Alert>}
        <OtpInput value={code} onChange={setCode} onComplete={(c) => void confirm(c)} disabled={busy || !enrollment} invalid={Boolean(error)} />
        <button type="submit" disabled={busy || code.length !== 6} className={buttonClass({ size: "lg", className: "w-full" })}>
          {busy && <Spinner />} Doğrula ve etkinleştir
        </button>
      </form>
    </div>
  );
}

function Bullet({ n }: { n: number }) {
  return (
    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-xs font-bold text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300")}>
      {n}
    </span>
  );
}
