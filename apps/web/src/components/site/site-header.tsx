"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Stethoscope, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "#doktorlar", label: "Doktorlar" },
  { href: "#branslar", label: "Branşlar" },
  { href: "#nasil-calisir", label: "Nasıl Çalışır?" },
  { href: "#ozellikler", label: "Neden MediBook360" },
  { href: "#sss", label: "SSS" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // The public site is light-only; undo a panel theme kept across navigation.
    document.documentElement.setAttribute("data-theme", "light");
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled ? "border-b border-line/80 bg-white/85 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="MediBook360 ana sayfa" className="shrink-0">
          <Logo className="h-7 sm:h-8" priority />
        </Link>

        <nav aria-label="Ana menü" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-navy-800/80 transition hover:bg-navy-50 hover:text-navy-800"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href="#kurumlar"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
          >
            <Stethoscope className="size-4 text-cyan-500" aria-hidden />
            Doktor musunuz?
          </a>
          <a href="#" className={buttonClass({ variant: "secondary", size: "sm" })}>
            Giriş Yap
          </a>
          <a href="#ara" className={buttonClass({ size: "sm" })}>
            Randevu Al
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobil-menu"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-line bg-white text-navy-800 lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div id="mobil-menu" className="border-t border-line bg-white px-4 pb-6 pt-2 shadow-lift lg:hidden">
          <nav aria-label="Mobil menü" className="flex flex-col">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-navy-800 hover:bg-navy-50"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <a href="#" className={buttonClass({ variant: "secondary" })}>
              Giriş Yap
            </a>
            <a href="#ara" onClick={() => setOpen(false)} className={buttonClass()}>
              Randevu Al
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
