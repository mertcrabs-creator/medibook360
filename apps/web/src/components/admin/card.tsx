import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-2xl border border-line bg-surface shadow-soft", className)}>{children}</section>;
}

export function CardHeader({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
      <div className="flex items-start gap-3">
        {icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700 dark:bg-cyan-400/10 dark:text-cyan-300">
            {icon}
          </span>
        )}
        <div>
          <h2 className="font-display text-base font-semibold text-fg">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
