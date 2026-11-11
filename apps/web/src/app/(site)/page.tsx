import {
  Activity,
  ArrowRight,
  Baby,
  BadgeCheck,
  BellRing,
  Bone,
  Brain,
  Building2,
  CalendarCheck,
  ChartColumn,
  ChevronDown,
  CircleCheck,
  Clock,
  Ear,
  Eye,
  FileHeart,
  HeartPulse,
  Hospital,
  Languages,
  LockKeyhole,
  MapPin,
  Plane,
  Search,
  ShieldCheck,
  Siren,
  Smile,
  Sparkles,
  Stethoscope,
  Users,
  Venus,
  Video,
} from "lucide-react";
import { HeroSearch } from "@/components/site/hero-search";
import { buttonClass } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Specialties />
      <HowItWorks />
      <Features />
      <ForProviders />
      <Faq />
      <FinalCta />
    </>
  );
}

/* ------------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative -mt-18 overflow-hidden pt-18">
      {/* Backdrop */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-cyan-50 via-white to-white" />
      <div aria-hidden className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
      <div aria-hidden className="absolute -right-40 -top-40 -z-10 size-[560px] rounded-full bg-cyan-300/30 blur-3xl" />
      <div aria-hidden className="absolute -left-40 top-60 -z-10 size-[420px] rounded-full bg-navy-200/40 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:px-8 lg:pb-28 lg:pt-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-navy-700 shadow-soft">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-cyan-500" />
            </span>
            360° sağlık deneyimi tek platformda
          </span>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-navy-800 sm:text-5xl lg:text-6xl">
            Doğru doktoru bulun,{" "}
            <span className="relative whitespace-nowrap text-cyan-500">
              saniyeler
              <svg aria-hidden viewBox="0 0 200 12" className="absolute -bottom-2 left-0 h-3 w-full text-cyan-300">
                <path d="M2 9c40-6 120-8 196-3" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>{" "}
            içinde randevu alın.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-800/70">
            Uzmanları karşılaştırın, size en uygun saati seçin, ister klinikte ister görüntülü görüşmeyle muayene olun.
            Doktorlar, klinikler ve hastaneler tek bir yerde.
          </p>

          <div className="mt-9">
            <HeroSearch />
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  const slots = [
    { t: "09:30", s: "full" },
    { t: "10:15", s: "open" },
    { t: "11:00", s: "picked" },
    { t: "13:45", s: "open" },
    { t: "14:30", s: "open" },
    { t: "16:00", s: "full" },
  ] as const;

  return (
    <div aria-hidden className="relative mx-auto hidden w-full max-w-md lg:block">
      <div className="absolute inset-6 rounded-[2.5rem] bg-linear-to-br from-navy-700 to-navy-900 rotate-3" />

      {/* Appointment card */}
      <div className="relative rounded-[2rem] border border-white/60 bg-white p-6 shadow-lift">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-300 to-cyan-500 font-display text-lg font-bold text-navy-900">
            DR
          </div>
          <div className="flex-1">
            <p className="font-display text-base font-semibold text-navy-800">Kardiyoloji Uzmanı</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
              <MapPin className="size-3.5" /> Şişli, İstanbul
            </p>
          </div>
          <BadgeCheck className="size-6 text-cyan-500" />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm font-semibold text-navy-800">Yarın, 14 Kasım</p>
          <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">4 boş saat</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {slots.map((slot) => (
            <div
              key={slot.t}
              className={
                slot.s === "picked"
                  ? "rounded-xl bg-navy-700 py-2.5 text-center text-sm font-semibold text-white shadow-soft"
                  : slot.s === "full"
                    ? "rounded-xl bg-surface-2 py-2.5 text-center text-sm font-medium text-subtle line-through"
                    : "rounded-xl border border-line py-2.5 text-center text-sm font-medium text-navy-800"
              }
            >
              {slot.t}
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-navy-950">
          <CalendarCheck className="size-4" /> Randevuyu onayla
        </div>
      </div>

      {/* Floating confirmations */}
      <div className="animate-float absolute -left-24 -top-8 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-lift">
        <span className="flex size-9 items-center justify-center rounded-full bg-emerald-50">
          <CircleCheck className="size-5 text-emerald-600" />
        </span>
        <div>
          <p className="text-sm font-semibold text-navy-800">Randevunuz onaylandı</p>
          <p className="text-xs text-muted">Hatırlatma 1 gün önce gelecek</p>
        </div>
      </div>
      <div className="animate-float absolute -bottom-8 -right-8 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-lift [animation-delay:1.5s]">
        <span className="flex size-9 items-center justify-center rounded-full bg-cyan-50">
          <Video className="size-5 text-cyan-600" />
        </span>
        <div>
          <p className="text-sm font-semibold text-navy-800">Görüntülü görüşme</p>
          <p className="text-xs text-muted">Evden muayene seçeneği</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

function TrustStrip() {
  const items = [
    { icon: BadgeCheck, title: "Doğrulanmış uzmanlar", text: "Diploma ve uzmanlık belgeleri kontrol edilir" },
    { icon: Clock, title: "7/24 online randevu", text: "Telefon beklemeden, istediğiniz saatte" },
    { icon: LockKeyhole, title: "KVKK uyumlu güvenlik", text: "Sağlık verileriniz şifrelenerek korunur" },
    { icon: Languages, title: "Çok dilli destek", text: "Türkiye'ye gelen hastalar için de" },
  ];
  return (
    <section aria-label="Neden güvenebilirsiniz" className="border-y border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-4 bg-white px-6 py-7">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
              <item.icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-display font-semibold text-navy-800">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

function SectionHeading({ eyebrow, title, text, center }: { eyebrow: string; title: string; text?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-600">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-lg leading-relaxed text-muted">{text}</p>}
    </div>
  );
}

function Specialties() {
  const items = [
    { icon: HeartPulse, name: "Kardiyoloji", hint: "Kalp ve damar" },
    { icon: Brain, name: "Nöroloji", hint: "Beyin ve sinir" },
    { icon: Eye, name: "Göz Hastalıkları", hint: "Görme ve göz sağlığı" },
    { icon: Smile, name: "Diş Hekimliği", hint: "Ağız ve diş" },
    { icon: Bone, name: "Ortopedi", hint: "Kemik ve eklem" },
    { icon: Baby, name: "Çocuk Sağlığı", hint: "Pediatri" },
    { icon: Sparkles, name: "Dermatoloji", hint: "Cilt ve saç" },
    { icon: Venus, name: "Kadın Doğum", hint: "Jinekoloji ve gebelik" },
    { icon: Ear, name: "Kulak Burun Boğaz", hint: "KBB" },
    { icon: Activity, name: "Göğüs Hastalıkları", hint: "Solunum yolları" },
    { icon: Stethoscope, name: "Dahiliye", hint: "İç hastalıkları" },
    { icon: Users, name: "Psikiyatri", hint: "Ruh sağlığı" },
  ];

  return (
    <section id="branslar" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Branşlar"
            title="İhtiyacınız olan uzmanlık alanını seçin"
            text="Şikâyetinize göre doğru branşı bulmak artık çok kolay."
          />
          <a href="#" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-cyan-600">
            Tüm branşlar <ArrowRight className="size-4" aria-hidden />
          </a>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {items.map((item) => (
            <li key={item.name}>
              <a
                href="#"
                className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lift"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-navy-50 to-cyan-50 text-navy-700 transition group-hover:from-navy-700 group-hover:to-navy-600 group-hover:text-cyan-300">
                  <item.icon className="size-6" aria-hidden />
                </span>
                <span className="mt-4 font-display text-[15px] font-semibold text-navy-800">{item.name}</span>
                <span className="mt-0.5 text-sm text-muted">{item.hint}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Arayın ve karşılaştırın",
      text: "Branş, şehir veya şikâyetinize göre arayın. Uzmanlık, konum, müsaitlik ve muayene türüne göre filtreleyin.",
    },
    {
      icon: CalendarCheck,
      title: "Uygun saati seçin",
      text: "Doktorun gerçek zamanlı takviminden size uyan saati seçin, randevunuz anında onaylansın.",
    },
    {
      icon: Stethoscope,
      title: "Muayeneye gidin",
      text: "Hatırlatmalarla randevunuzu kaçırmayın. Klinikte ya da görüntülü görüşmeyle muayene olun.",
    },
  ];

  return (
    <section id="nasil-calisir" className="scroll-mt-20 bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading center eyebrow="Nasıl çalışır?" title="Üç adımda randevunuz hazır" />

        <ol className="relative mt-16 grid gap-8 lg:grid-cols-3">
          <div aria-hidden className="absolute left-[16.6%] right-[16.6%] top-8 hidden h-px bg-linear-to-r from-cyan-200 via-navy-200 to-cyan-200 lg:block" />
          {steps.map((step, i) => (
            <li key={step.title} className="relative text-center">
              <div className="relative mx-auto flex size-16 items-center justify-center rounded-2xl bg-navy-700 text-cyan-300 shadow-lift">
                <step.icon className="size-7" aria-hidden />
                <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-cyan-400 font-display text-sm font-bold text-navy-950 ring-4 ring-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold text-navy-800">{step.title}</h3>
              <p className="mx-auto mt-3 max-w-sm leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

function Features() {
  return (
    <section id="ozellikler" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Neden MediBook360"
          title="Sağlık yolculuğunuzun her adımı için"
          text="Randevudan takibe, acil durumdan sağlık turizmine kadar 360° bir deneyim."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
          {/* Large feature */}
          <article className="relative overflow-hidden rounded-3xl bg-linear-to-br from-navy-700 via-navy-800 to-navy-950 p-8 text-white lg:row-span-2">
            <div aria-hidden className="absolute -right-24 -top-24 size-72 rounded-full bg-cyan-400/20 blur-3xl" />
            <span className="flex size-12 items-center justify-center rounded-xl bg-white/10 text-cyan-300 ring-1 ring-white/15">
              <Video className="size-6" aria-hidden />
            </span>
            <h3 className="mt-6 font-display text-2xl font-semibold">Görüntülü muayene</h3>
            <p className="mt-3 leading-relaxed text-navy-100/80">
              Kontrol muayeneleri, tahlil sonuçlarının değerlendirilmesi veya ikinci görüş için evinizden çıkmadan doktorunuzla
              görüşün.
            </p>
            <div className="mt-8 space-y-3 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              {["Uçtan uca şifreli görüşme", "Görüşme sonrası e-reçete ve rapor", "Randevu öncesi otomatik hatırlatma"].map(
                (line) => (
                  <p key={line} className="flex items-center gap-3 text-sm text-navy-50">
                    <CircleCheck className="size-4 shrink-0 text-cyan-400" aria-hidden /> {line}
                  </p>
                ),
              )}
            </div>
          </article>

          <FeatureCard icon={BellRing} title="Akıllı hatırlatmalar" text="Randevu, ilaç ve kontrol zamanlarını SMS, e-posta veya bildirimle hatırlatırız." />
          <FeatureCard icon={Siren} title="Yakınımdaki acil" text="Konumunuza en yakın acil servisleri ve nöbetçi eczaneleri tek dokunuşla bulun." />
          <FeatureCard icon={FileHeart} title="Sağlık dosyam" text="Randevu geçmişi, raporlar ve tahlil sonuçlarınız güvenle tek bir yerde." />
          <FeatureCard icon={Plane} title="Sağlık turizmi" text="Yurt dışından gelen hastalar için çok dilli arayüz, transfer ve konaklama desteği." />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, text }: { icon: typeof Video; title: string; text: string }) {
  return (
    <article className="rounded-3xl border border-line bg-white p-7 shadow-soft transition hover:shadow-lift">
      <span className="flex size-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="mt-5 font-display text-lg font-semibold text-navy-800">{title}</h3>
      <p className="mt-2 leading-relaxed text-muted">{text}</p>
    </article>
  );
}

/* ------------------------------------------------------------------------ */

function ForProviders() {
  const cards = [
    { icon: Stethoscope, title: "Doktorlar", text: "Profilinizi oluşturun, takviminizi yönetin, yeni hastalara ulaşın." },
    { icon: Building2, title: "Klinikler", text: "Tüm hekimlerinizin randevularını tek panelden yönetin." },
    { icon: Hospital, title: "Hastaneler", text: "Bölümler, şubeler ve çağrı merkezi için kurumsal çözüm." },
  ];
  return (
    <section id="kurumlar" className="scroll-mt-20 px-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-navy-950 px-6 py-16 sm:px-12 lg:px-16 lg:py-20">
        <div aria-hidden className="bg-grid absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div aria-hidden className="absolute -right-32 top-0 size-96 rounded-full bg-cyan-400/25 blur-3xl" />

        <div className="relative grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-400">Sağlık kurumları için</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Hastalarınız sizi burada arıyor.
            </h2>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-navy-100/75">
              Online randevu, hasta yönetimi ve görünürlük araçlarıyla muayenehanenizi ya da kurumunuzu dijitale taşıyın.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { icon: CalendarCheck, text: "Akıllı takvim yönetimi" },
                { icon: ChartColumn, text: "Performans raporları" },
                { icon: ShieldCheck, text: "KVKK uyumlu altyapı" },
                { icon: BellRing, text: "Otomatik hasta hatırlatma" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-navy-50">
                  <item.icon className="size-5 text-cyan-400" aria-hidden /> {item.text}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#" className={buttonClass({ variant: "accent", size: "lg" })}>
                Kurumunuzu ekleyin <ArrowRight className="size-4" aria-hidden />
              </a>
              <a
                href="#"
                className={buttonClass({
                  variant: "ghost",
                  size: "lg",
                  className: "text-white ring-1 ring-white/20 hover:bg-white/10 hover:text-white",
                })}
              >
                Demo talep edin
              </a>
            </div>
          </div>

          <div className="grid gap-4">
            {cards.map((card) => (
              <div
                key={card.title}
                className="flex items-start gap-5 rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/[0.09]"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-navy-950">
                  <card.icon className="size-6" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">{card.title}</h3>
                  <p className="mt-1 text-navy-100/70">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

function Faq() {
  const items = [
    {
      q: "MediBook360 üzerinden randevu almak ücretli mi?",
      a: "Hastalar için randevu almak ücretsizdir. Muayene ücreti doğrudan doktor veya kurum tarafından belirlenir ve profilinde gösterilir.",
    },
    {
      q: "Randevumu nasıl iptal eder veya değiştiririm?",
      a: "Randevularım sayfasından, doktorun belirlediği iptal süresi dolmadan randevunuzu tek tıkla iptal edebilir ya da başka bir saate taşıyabilirsiniz.",
    },
    {
      q: "Sağlık verilerim güvende mi?",
      a: "Verileriniz KVKK'ya uygun olarak işlenir, aktarım ve saklama sırasında şifrelenir. Bilgileriniz yalnızca randevu aldığınız sağlık profesyoneliyle paylaşılır.",
    },
    {
      q: "Görüntülü görüşme nasıl çalışıyor?",
      a: "Görüntülü muayene sunan doktorlardan randevu alırken 'Online' seçeneğini seçin. Randevu saatinde size gönderilen bağlantıdan, ek uygulama kurmadan görüşmeye katılırsınız.",
    },
    {
      q: "Doktor olarak nasıl kayıt olabilirim?",
      a: "'Doktor musunuz?' bağlantısından başvurunuzu yapın. Uzmanlık belgeleriniz doğrulandıktan sonra profiliniz yayına alınır.",
    },
  ];
  return (
    <section id="sss" className="scroll-mt-20 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:px-8">
        <SectionHeading
          eyebrow="Sıkça sorulan sorular"
          title="Aklınıza takılanlar"
          text="Cevabını bulamadığınız bir soru varsa destek ekibimiz size yardımcı olmaktan mutluluk duyar."
        />
        <div className="divide-y divide-line rounded-3xl border border-line bg-white shadow-soft">
          {items.map((item) => (
            <details key={item.q} className="group px-6 py-5 [&[open]]:bg-surface-2/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-[17px] font-semibold text-navy-800">
                {item.q}
                <ChevronDown className="size-5 shrink-0 text-cyan-600 transition group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="pb-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">
          Sağlığınız için doğru adım, <span className="text-cyan-500">bugün</span>.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          Size en uygun uzmanı bulun ve randevunuzu birkaç tıkla oluşturun.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#ara" className={buttonClass({ size: "lg" })}>
            <Search className="size-4" aria-hidden /> Doktor ara
          </a>
          <a href="#kurumlar" className={buttonClass({ variant: "secondary", size: "lg" })}>
            Kurumlar için
          </a>
        </div>
      </div>
    </section>
  );
}
