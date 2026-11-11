"use client";

import { useCallback, useEffect, useState } from "react";
import { Filter, ScrollText } from "lucide-react";
import { Card, CardHeader } from "@/components/admin/card";
import { Alert, Spinner } from "@/components/admin/form";
import { CardSkeleton } from "@/components/admin/skeletons";
import { buttonClass } from "@/components/ui/button";
import { api, ApiError, type AuditEntry } from "@/lib/api";
import { cn } from "@/lib/cn";
import { AUDIT_ACTIONS, auditMeta, dateTime, describeAgent } from "@/lib/format";

const TONES = {
  ok: "bg-success/10 text-success",
  warn: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-cyan-400/10 text-cyan-700 dark:text-cyan-300",
};

export function AuditPage() {
  const [action, setAction] = useState("");
  const [items, setItems] = useState<AuditEntry[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (after?: string) => {
      const params = new URLSearchParams();
      if (action) params.set("action", action);
      if (after) params.set("cursor", after);
      const qs = params.toString();
      return api<{ items: AuditEntry[]; nextCursor: string | null }>(`/admin/audit-logs${qs ? `?${qs}` : ""}`);
    },
    [action],
  );

  useEffect(() => {
    let cancelled = false;
    fetchPage()
      .then((r) => {
        if (cancelled) return;
        setError(null);
        setItems(r.items);
        setCursor(r.nextCursor);
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Kayıtlar yüklenemedi."));
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const r = await fetchPage(cursor);
      setItems((prev) => [...(prev ?? []), ...r.items]);
      setCursor(r.nextCursor);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kayıtlar yüklenemedi.");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <Card>
      <CardHeader
        icon={<ScrollText className="size-4.5" />}
        title="Denetim kayıtları"
        description="Paneldeki tüm güvenlik olayları. Kayıtlar değiştirilemez ve silinemez."
        action={
          <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm">
            <Filter className="size-4 text-subtle" aria-hidden />
            <span className="sr-only">Olay türü</span>
            <select
              value={action}
              onChange={(e) => {
                setItems(null);
                setAction(e.target.value);
              }} className="bg-transparent text-fg focus:outline-none">
              <option value="">Tüm olaylar</option>
              {Object.entries(AUDIT_ACTIONS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </label>
        }
      />

      {error && (
        <div className="p-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {!items ? (
        <div className="p-4">
          <CardSkeleton className="h-96" />
        </div>
      ) : items.length === 0 ? (
        <p className="px-6 py-16 text-center text-sm text-muted">Bu filtreyle eşleşen kayıt yok.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-subtle">
                <th scope="col" className="px-6 py-3">Olay</th>
                <th scope="col" className="px-4 py-3">Hesap</th>
                <th scope="col" className="px-4 py-3">Cihaz</th>
                <th scope="col" className="px-4 py-3">IP</th>
                <th scope="col" className="px-6 py-3 text-right">Zaman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => {
                const meta = auditMeta(item.action);
                const agent = describeAgent(item.userAgent);
                const email = typeof item.details?.email === "string" ? item.details.email : null;
                return (
                  <tr key={item.id} className="transition hover:bg-surface-2/50">
                    <td className="px-6 py-3.5">
                      <span className="flex items-center gap-3">
                        <span className={cn("flex size-8 items-center justify-center rounded-lg", TONES[meta.tone])}>
                          <meta.icon className="size-4" aria-hidden />
                        </span>
                        <span className="font-medium text-fg">{meta.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {item.user ? (
                        <>
                          <span className="block font-medium text-fg">{item.user.name}</span>
                          <span className="block text-xs text-muted">{item.user.email}</span>
                        </>
                      ) : (
                        <span className="text-muted">{email ?? "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-muted" title={item.userAgent ?? undefined}>
                      {agent.browser} · {agent.os}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted">{item.ip ?? "—"}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right text-muted">
                      <time dateTime={item.createdAt}>{dateTime(item.createdAt)}</time>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {cursor && (
        <div className="flex justify-center border-t border-line p-4">
          <button onClick={() => void loadMore()} disabled={loadingMore} className={buttonClass({ variant: "secondary", size: "sm" })}>
            {loadingMore && <Spinner />} Daha fazla yükle
          </button>
        </div>
      )}
    </Card>
  );
}
