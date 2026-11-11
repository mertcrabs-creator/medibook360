import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-all duration-150 select-none disabled:pointer-events-none disabled:opacity-55 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-navy-700 text-white shadow-soft hover:bg-navy-600 dark:bg-cyan-400 dark:text-navy-950 dark:hover:bg-cyan-300",
  accent: "bg-cyan-400 text-navy-950 shadow-glow hover:bg-cyan-300",
  secondary: "border border-line-strong bg-surface text-fg shadow-soft hover:bg-surface-2",
  ghost: "text-muted hover:bg-surface-2 hover:text-fg",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

/** Button classes, for <button> and <Link> alike. */
export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}
