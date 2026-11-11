/**
 * Browser-side API client. Requests go to /api/* on this origin, which
 * Next.js forwards to the NestJS API; the session cookie is HttpOnly and
 * travels on its own.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly retryAfter?: number,
  ) {
    super(message);
  }
}

const FALLBACK: Record<number, string> = {
  400: "Gönderilen bilgiler geçersiz.",
  401: "Oturumunuz sona erdi. Lütfen yeniden giriş yapın.",
  403: "Bu işlem için yetkiniz yok.",
  404: "Kayıt bulunamadı.",
  409: "Bu işlem şu anda yapılamıyor.",
  429: "Çok fazla deneme yaptınız. Lütfen biraz bekleyip tekrar deneyin.",
};

const CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: "E-posta veya şifre hatalı.",
  invalid_code: "Kod hatalı ya da süresi geçmiş.",
  invalid_password: "Mevcut şifre hatalı.",
  invalid_setup_token: "Kurulum kodu geçersiz. API konsolundaki güncel kodu girin.",
  setup_done: "Kurulum zaten tamamlanmış. Giriş sayfasına yönlendiriliyorsunuz.",
  mfa_enrolled: "İki adımlı doğrulama zaten etkin.",
  mfa_required: "Doğrulama kodu gerekiyor.",
  missing_credentials: "Oturumunuz sona erdi. Lütfen yeniden giriş yapın.",
  forbidden: "Bu alana erişim yetkiniz yok.",
};

export async function api<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method: init.method ?? (init.body ? "POST" : "GET"),
      credentials: "same-origin",
      cache: "no-store",
      headers: init.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError("Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.", 0);
  }

  if (response.status === 204) return undefined as T;
  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;

  if (!response.ok) {
    const code = typeof data?.errorCode === "string" ? data.errorCode : undefined;
    const raw = data?.message;
    let message = FALLBACK[response.status] ?? "Beklenmeyen bir hata oluştu.";
    if (code && CODE_MESSAGES[code]) {
      message = CODE_MESSAGES[code];
    } else if (response.status === 400 && Array.isArray(raw) && raw.length) {
      // Validation: the API's schemas carry Turkish messages; drop the field prefix.
      message = String(raw[0]).replace(/^[\w.]+:\s*/, "");
    }
    const retry = Number(response.headers.get("retry-after"));
    throw new ApiError(message, response.status, code, Number.isFinite(retry) && retry > 0 ? retry : undefined);
  }
  return data as T;
}

/* --- Response types (mirror the API) ------------------------------------ */

export type Me = {
  user: { id: string; email: string; name: string; role: "SUPER_ADMIN" | "ADMIN"; lastLoginAt: string | null };
  mfa: { enrolled: boolean; verified: boolean };
  session: { expiresAt: string | null };
};

export type AuditEntry = {
  id: string;
  action: string;
  ip: string | null;
  userAgent: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
};

export type Overview = {
  admins: number;
  activeSessions: number;
  signIns24h: number;
  failed24h: number;
  recent: AuditEntry[];
  system: {
    database: { status: string; latencyMs: number };
    api: { status: string; uptimeSeconds: number; node: string };
  };
};

export type SessionInfo = {
  id: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  userAgent: string | null;
  ip: string | null;
  current: boolean;
};
