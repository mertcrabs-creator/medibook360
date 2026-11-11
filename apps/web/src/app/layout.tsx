import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Outfit echoes the geometric, rounded wordmark of the logo; Plus Jakarta Sans
// keeps body text readable. Both cover Turkish characters (latin-ext).
const display = Outfit({
  variable: "--font-display-face",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "MediBook360 — Doktorunu bul, randevunu al",
    template: "%s · MediBook360",
  },
  description:
    "MediBook360; hastaları doktor, klinik ve hastanelerle buluşturan çok dilli sağlık platformu. Uzmanları karşılaştırın, uygun saati seçin, randevunuzu saniyeler içinde alın.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#06131b" },
  ],
};

// Applies the admin panel's saved theme before the first paint. The public
// site is light-only for now.
const themeScript = `(function(){try{if(location.pathname.indexOf("/yonetim")!==0)return;var t=localStorage.getItem("mb360-theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" data-theme="light" suppressHydrationWarning className={`${display.variable} ${body.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
