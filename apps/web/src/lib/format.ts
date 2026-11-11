import {
  CircleAlert,
  KeyRound,
  LogIn,
  LogOut,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  UserX,
  type LucideIcon,
} from "lucide-react";

export const AUDIT_ACTIONS: Record<string, { label: string; icon: LucideIcon; tone: "ok" | "warn" | "danger" | "info" }> = {
  "setup-completed": { label: "İlk kurulum tamamlandı", icon: Rocket, tone: "info" },
  "sign-in": { label: "Başarılı giriş", icon: LogIn, tone: "ok" },
  "sign-in-failed": { label: "Başarısız giriş denemesi", icon: UserX, tone: "danger" },
  "mfa-verified": { label: "2FA doğrulandı", icon: ShieldCheck, tone: "ok" },
  "mfa-failed": { label: "Hatalı 2FA kodu", icon: ShieldAlert, tone: "danger" },
  "mfa-enabled": { label: "2FA etkinleştirildi", icon: Smartphone, tone: "info" },
  "recovery-codes-regenerated": { label: "Kurtarma kodları yenilendi", icon: KeyRound, tone: "warn" },
  "password-changed": { label: "Şifre değiştirildi", icon: KeyRound, tone: "warn" },
  "session-revoked": { label: "Bir oturum sonlandırıldı", icon: LogOut, tone: "warn" },
  "sessions-revoked-others": { label: "Diğer oturumlar kapatıldı", icon: LogOut, tone: "warn" },
  "sign-out": { label: "Çıkış yapıldı", icon: LogOut, tone: "info" },
};

export function auditMeta(action: string) {
  return AUDIT_ACTIONS[action] ?? { label: action, icon: CircleAlert, tone: "info" as const };
}

const rtf = new Intl.RelativeTimeFormat("tr", { numeric: "auto" });

export function relativeTime(iso: string, now = Date.now()) {
  const diff = (new Date(iso).getTime() - now) / 1000;
  const abs = Math.abs(diff);
  if (abs < 45) return "az önce";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86400), "day");
}

export function dateTime(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

/** "Chrome · Windows" from a user agent, good enough for a sessions list. */
export function describeAgent(ua: string | null) {
  if (!ua) return { browser: "Bilinmeyen tarayıcı", os: "Bilinmeyen cihaz", mobile: false };
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : /curl|node|undici/i.test(ua)
              ? "API istemcisi"
              : "Tarayıcı";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /iPhone|iPad/.test(ua)
      ? "iOS"
      : /Android/.test(ua)
        ? "Android"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Bilinmeyen";
  return { browser, os, mobile: /Mobile|Android|iPhone/.test(ua) };
}

export function uptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return d ? `${d}g ${h}s` : h ? `${h}s ${m}dk` : `${m}dk`;
}
