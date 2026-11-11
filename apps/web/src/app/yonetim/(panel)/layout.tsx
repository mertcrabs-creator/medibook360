import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PanelShell } from "@/components/admin/panel-shell";
import { PanelSkeleton } from "@/components/admin/skeletons";
import { getAdminState } from "@/lib/server-auth";

/**
 * Every panel page renders only after the API confirmed a signed-in panel
 * user whose session passed the second factor. The API enforces the same
 * rule on every admin endpoint; this keeps the panel UI from rendering at all
 * for anyone else.
 */
export default function PanelLayout({ children }: LayoutProps<"/yonetim">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <PanelGate>{children}</PanelGate>
    </Suspense>
  );
}

async function PanelGate({ children }: { children: React.ReactNode }) {
  const state = await getAdminState();
  switch (state.kind) {
    case "ready":
      return <PanelShell me={state.me}>{children}</PanelShell>;
    case "mfa-enroll":
      redirect("/yonetim/iki-adimli-dogrulama");
    case "unavailable":
      return (
        <div className="m-auto max-w-md p-8 text-center">
          <h1 className="font-display text-xl font-semibold">Sunucuya ulaşılamıyor</h1>
          <p className="mt-2 text-muted">API veya veritabanı şu anda yanıt vermiyor. Lütfen birazdan tekrar deneyin.</p>
        </div>
      );
    default:
      redirect("/yonetim/giris");
  }
}
