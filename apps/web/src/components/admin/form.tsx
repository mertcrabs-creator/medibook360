"use client";

import { useId, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { CircleAlert, CircleCheck, Eye, EyeOff, Info, LoaderCircle, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

const inputClass =
  "h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[15px] text-fg shadow-soft transition placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-4 focus:ring-cyan-400/15 aria-invalid:border-danger aria-invalid:ring-danger/10";

export function Field({
  label,
  hint,
  error,
  children,
  action,
}: {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  action?: ReactNode;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => ReactNode;
}) {
  const id = useId();
  const descId = `${id}-desc`;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-fg">
          {label}
        </label>
        {action}
      </div>
      {children({ id, "aria-describedby": hint || error ? descId : undefined, "aria-invalid": error ? true : undefined })}
      {(error || hint) && (
        <p id={descId} className={cn("mt-2 text-sm", error ? "text-danger" : "text-muted")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        spellCheck={false}
        autoCapitalize="none"
        className={cn(inputClass, "pr-12", props.className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
        className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg"
      >
        {visible ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
      </button>
    </div>
  );
}

/** Six separate digit boxes; paste fills them all; calls onComplete at 6 digits. */
export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const set = (next: string, focusIndex?: number) => {
    const clean = next.replace(/\D/g, "").slice(0, 6);
    onChange(clean);
    if (focusIndex !== undefined) refs.current[Math.min(focusIndex, 5)]?.focus();
    if (clean.length === 6) onComplete?.(clean);
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="6 haneli doğrulama kodu">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`${i + 1}. hane`}
          aria-invalid={invalid || undefined}
          maxLength={6}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const typed = e.target.value.replace(/\D/g, "");
            if (!typed) return;
            if (typed.length > 1) {
              set(value.slice(0, i) + typed, i + typed.length);
              return;
            }
            const next = (value.slice(0, i) + typed + value.slice(i + 1)).slice(0, 6);
            set(next, i + 1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              if (digit) set(value.slice(0, i) + value.slice(i + 1));
              else if (i > 0) set(value.slice(0, i - 1) + value.slice(i), i - 1);
            } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            else if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            set(e.clipboardData.getData("text"), 5);
          }}
          className={cn(
            "h-14 w-full min-w-0 rounded-xl border bg-surface text-center font-display text-2xl font-semibold text-fg shadow-soft transition focus:border-accent focus:outline-none focus:ring-4 focus:ring-cyan-400/15 disabled:opacity-60",
            invalid ? "border-danger" : digit ? "border-navy-300 dark:border-cyan-700" : "border-line-strong",
          )}
        />
      ))}
    </div>
  );
}

export function Alert({ tone = "error", children }: { tone?: "error" | "info" | "success" | "warning"; children: ReactNode }) {
  const styles = {
    error: "border-danger/25 bg-danger/[0.06] text-danger",
    info: "border-cyan-500/25 bg-cyan-400/[0.07] text-navy-700 dark:text-cyan-200",
    success: "border-success/25 bg-success/[0.07] text-success",
    warning: "border-warning/30 bg-warning/[0.08] text-warning",
  }[tone];
  const Icon = { error: CircleAlert, info: Info, success: CircleCheck, warning: TriangleAlert }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-3 rounded-xl border px-4 py-3 text-sm", styles)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={cn("size-4 animate-spin", className)} aria-hidden />;
}

/** Rough strength estimate, for feedback only: the API enforces the real policy. */
export function passwordChecks(password: string, email = "") {
  const classes = [/[a-zçğıöşü]/, /[A-ZÇĞİÖŞÜ]/, /\d/, /[^\wçğıöşüÇĞİÖŞÜ]/].filter((r) => r.test(password)).length;
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  return [
    { ok: password.length >= 12, label: "En az 12 karakter" },
    { ok: classes >= 3, label: "Büyük/küçük harf, rakam ve sembolden en az üçü" },
    { ok: new Set(password).size >= 6, label: "Tekrarlı olmayan karakterler" },
    { ok: password.length > 0 && !(local.length >= 3 && password.toLowerCase().includes(local)), label: "E-posta adınızı içermiyor" },
  ];
}

export function PasswordStrength({ password, email }: { password: string; email?: string }) {
  const checks = passwordChecks(password, email);
  const score = password ? checks.filter((c) => c.ok).length + (password.length >= 16 ? 1 : 0) : 0;
  const levels = ["Çok zayıf", "Zayıf", "Orta", "İyi", "Güçlü", "Çok güçlü"];
  const colors = ["bg-danger", "bg-danger", "bg-warning", "bg-cyan-500", "bg-success", "bg-success"];
  return (
    <div className="mt-3">
      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={cn("h-1.5 flex-1 rounded-full transition", i < score ? colors[score] : "bg-line")} />
        ))}
      </div>
      <p className="mt-2 text-xs font-medium text-muted">
        Şifre gücü: <span className="text-fg">{password ? levels[score] : "—"}</span>
      </p>
      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {checks.map((c) => (
          <li key={c.label} className={cn("flex items-center gap-2 text-xs", c.ok ? "text-success" : "text-muted")}>
            <CircleCheck className={cn("size-3.5", c.ok ? "opacity-100" : "opacity-40")} aria-hidden />
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
