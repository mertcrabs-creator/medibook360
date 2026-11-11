import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Alert } from "@/components/admin/form";
import { MfaEnroll } from "@/components/admin/mfa-enroll";
import { AuthSkeleton } from "@/components/admin/skeletons";
import { getAdminState } from "@/lib/server-auth";

export const metadata: Metadata = { title: "İki adımlı doğrulama" };

export default function MfaEnrollPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <EnrollGate />
    </Suspense>
  );
}

async function EnrollGate() {
  const state = await getAdminState();
  if (state.kind === "ready") redirect("/yonetim");
  if (state.kind === "signed-out" || state.kind === "mfa-pending") redirect("/yonetim/giris");
  if (state.kind === "unavailable") {
    return <Alert tone="warning">Sunucuya şu anda ulaşılamıyor. Lütfen sayfayı yenileyin.</Alert>;
  }
  return <MfaEnroll email={state.me.user.email} />;
}
