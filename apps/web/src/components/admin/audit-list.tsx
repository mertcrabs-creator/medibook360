"use client";

import { type AuditEntry } from "@/lib/api";
import { cn } from "@/lib/cn";
import { auditMeta, dateTime, describeAgent, relativeTime } from "@/lib/format";

const TONES = {
  ok: "bg-success/10 text-success",
  warn: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-cyan-400/10 text-cyan-600 dark:text-cyan-300",
};

export function AuditTimeline({ items }: { items: AuditEntry[] }) {
  if (!items.length) {
    return <p className="py-10 text-center text-sm text-muted">Henüz kayıt yok.</p>;
  }
  return (
    <ol className="relative space-y-1">
      {items.map((item) => {
        const meta = auditMeta(item.action);
        const agent = describeAgent(item.userAgent);
        const email = typeof item.details?.email === "string" ? item.details.email : null;
        return (
          <li key={item.id} className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition hover:bg-surface-2/60">
            <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", TONES[meta.tone])}>
              <meta.icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-fg">{meta.label}</p>
              <p className="truncate text-xs text-muted">
                {item.user?.name ?? email ?? "Bilinmeyen hesap"} · {agent.browser}, {agent.os}
                {item.ip ? ` · ${item.ip}` : ""}
              </p>
            </div>
            <time dateTime={item.createdAt} title={dateTime(item.createdAt)} className="shrink-0 text-xs text-subtle">
              {relativeTime(item.createdAt)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
