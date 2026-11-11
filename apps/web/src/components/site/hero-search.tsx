"use client";

import { useState } from "react";
import { Building2, Hospital, MapPin, Search, Stethoscope } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { id: "doktor", label: "Doktor", icon: Stethoscope, placeholder: "Branş, doktor adı veya şikâyet" },
  { id: "klinik", label: "Klinik", icon: Building2, placeholder: "Klinik adı veya tedavi" },
  { id: "hastane", label: "Hastane", icon: Hospital, placeholder: "Hastane adı veya bölüm" },
] as const;

const POPULAR = ["Kardiyoloji", "Dermatoloji", "Diş hekimi", "Göz hastalıkları", "Psikiyatri", "Çocuk sağlığı"];

export function HeroSearch() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("doktor");
  const [query, setQuery] = useState("");
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div id="ara" className="scroll-mt-28">
      <div className="rounded-3xl border border-white/70 bg-white/90 p-2 shadow-lift backdrop-blur-xl">
        <div role="tablist" aria-label="Arama türü" className="flex gap-1 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
                tab === t.id ? "bg-navy-700 text-white shadow-soft" : "text-navy-800/70 hover:bg-navy-50",
              )}
            >
              <t.icon className="size-4" aria-hidden />
              {t.label}
            </button>
          ))}
        </div>

        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
          className="mt-1 grid gap-2 rounded-2xl bg-surface-2/70 p-2 sm:grid-cols-[1.6fr_1fr_auto]"
        >
          <label className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-line focus-within:ring-2 focus-within:ring-cyan-400">
            <Search className="size-5 shrink-0 text-cyan-500" aria-hidden />
            <span className="sr-only">Ne arıyorsunuz?</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={active.placeholder}
              className="w-full bg-transparent text-[15px] text-navy-900 placeholder:text-subtle focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-line focus-within:ring-2 focus-within:ring-cyan-400">
            <MapPin className="size-5 shrink-0 text-cyan-500" aria-hidden />
            <span className="sr-only">Konum</span>
            <input
              placeholder="Şehir veya ilçe"
              className="w-full bg-transparent text-[15px] text-navy-900 placeholder:text-subtle focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-full min-h-12 items-center justify-center gap-2 rounded-xl bg-navy-700 px-7 text-[15px] font-semibold text-white transition hover:bg-navy-600 active:scale-[0.98]"
          >
            <Search className="size-4" aria-hidden />
            Ara
          </button>
        </form>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-navy-800/60">Popüler:</span>
        {POPULAR.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setQuery(p)}
            className="rounded-full border border-navy-100 bg-white/70 px-3 py-1 text-sm font-medium text-navy-700 transition hover:border-cyan-400 hover:text-navy-900"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
