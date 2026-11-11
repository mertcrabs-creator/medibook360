import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Yönetim Paneli", template: "%s · Yönetim · MediBook360" },
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default function AdminRootLayout({ children }: LayoutProps<"/yonetim">) {
  return <div className="flex min-h-dvh flex-col bg-bg text-fg">{children}</div>;
}
