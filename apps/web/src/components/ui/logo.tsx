import Image from "next/image";
import logo from "../../../public/brand/medibook360-logo.png";
import logoLight from "../../../public/brand/medibook360-logo-light.png";
import { cn } from "@/lib/cn";

/**
 * The MediBook360 wordmark. `tone="light"` is for dark backgrounds (white
 * wordmark, cyan 360); `tone="auto"` follows the panel's theme.
 */
export function Logo({
  tone = "brand",
  className,
  priority,
}: {
  tone?: "brand" | "light" | "auto";
  className?: string;
  priority?: boolean;
}) {
  if (tone === "auto") {
    return (
      <span className={cn("relative inline-block", className)}>
        <Image src={logo} alt="MediBook360" priority={priority} className="h-full w-auto dark:hidden" />
        <Image src={logoLight} alt="MediBook360" priority={priority} className="hidden h-full w-auto dark:block" />
      </span>
    );
  }
  return (
    <Image
      src={tone === "light" ? logoLight : logo}
      alt="MediBook360"
      priority={priority}
      className={cn("w-auto", className)}
    />
  );
}

/** Square brand mark (magnifier), for tight spaces. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <rect width="64" height="64" rx="16" fill="#003C56" />
      <circle cx="29" cy="28" r="14" fill="none" stroke="#fff" strokeWidth="6" />
      <path d="M23.5 27.5a6 6 0 0 1 6-6" fill="none" stroke="#00D0FF" strokeWidth="3" strokeLinecap="round" />
      <path d="M39.5 38.5l9 9" stroke="#00D0FF" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}
