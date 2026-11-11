import "server-only";
import { cookies } from "next/headers";
import type { Me } from "./api";

const API = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";

export type AdminState =
  | { kind: "signed-out" }
  | { kind: "mfa-pending" }
  | { kind: "mfa-enroll"; me: Me }
  | { kind: "ready"; me: Me }
  | { kind: "unavailable" };

/**
 * Asks the API who this request's session belongs to. Called from Server
 * Components behind a Suspense boundary; never cached.
 */
export async function getAdminState(): Promise<AdminState> {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) return { kind: "signed-out" };

  let response: Response;
  try {
    response = await fetch(`${API}/api/auth/me`, {
      headers: { cookie: cookieHeader, accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    return { kind: "unavailable" };
  }

  if (response.status === 401) {
    const body = (await response.json().catch(() => null)) as { errorCode?: string } | null;
    return body?.errorCode === "mfa_required" ? { kind: "mfa-pending" } : { kind: "signed-out" };
  }
  if (!response.ok) return { kind: "unavailable" };

  const me = (await response.json()) as Me;
  if (!me.mfa.enrolled) return { kind: "mfa-enroll", me };
  if (!me.mfa.verified) return { kind: "mfa-pending" };
  return { kind: "ready", me };
}

/** Whether the first admin still has to be created. `null` when the API is down. */
export async function isSetupRequired(): Promise<boolean | null> {
  try {
    const response = await fetch(`${API}/api/auth/setup`, { cache: "no-store" });
    if (!response.ok) return null;
    return ((await response.json()) as { required: boolean }).required;
  } catch {
    return null;
  }
}
