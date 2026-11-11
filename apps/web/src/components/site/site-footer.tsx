import { Globe, Mail, MapPin, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const COLUMNS = [
  {
    title: "Hastalar için",
    links: ["Doktor ara", "Online görüşme", "Nöbetçi eczaneler", "Sağlık rehberi", "Randevularım"],
  },
  {
    title: "Kurumlar için",
    links: ["Doktor olarak katıl", "Klinik / hastane kaydı", "Randevu yönetimi", "Fiyatlandırma", "İş ortaklığı"],
  },
  {
    title: "MediBook360",
    links: ["Hakkımızda", "Kariyer", "Basın", "İletişim", "Yardım merkezi"],
  },
  {
    title: "Yasal",
    links: ["KVKK aydınlatma metni", "Gizlilik politikası", "Çerez politikası", "Kullanım koşulları"],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-navy-900 bg-navy-950 text-navy-100">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_3fr]">
          <div className="max-w-sm">
            <Logo tone="light" className="h-8" />
            <p className="mt-5 text-sm leading-relaxed text-navy-200/80">
              Hastaları doğru doktor, klinik ve hastanelerle buluşturan çok dilli sağlık platformu.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-navy-200/80">
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 text-cyan-400" aria-hidden /> destek@medibook360.com
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="size-4 text-cyan-400" aria-hidden /> İstanbul, Türkiye
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="font-display text-sm font-semibold tracking-wide text-white">{col.title}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-navy-200/75 transition hover:text-cyan-300">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-navy-200/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 MediBook360. Tüm hakları saklıdır.</p>
          <div className="flex flex-wrap items-center gap-5">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-cyan-400" aria-hidden /> KVKK uyumlu altyapı
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-navy-100 hover:border-cyan-400/60"
            >
              <Globe className="size-4" aria-hidden /> Türkçe
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
