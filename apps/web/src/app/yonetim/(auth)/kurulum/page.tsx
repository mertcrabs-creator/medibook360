import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Alert } from "@/components/admin/form";
import { SetupForm } from "@/components/admin/setup-form";
import { AuthSkeleton } from "@/components/admin/skeletons";
import { isSetupRequired } from "@/lib/server-auth";

export const metadata: Metadata = { title: "İlk kurulum" };

export default function SetupPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <SetupGate />
    </Suspense>
  );
}

async function SetupGate() {
  const required = await isSetupRequired();
  if (required === false) redirect("/yonetim/giris");
  if (required === null) {
    return (
      <Alert tone="warning">
        Sunucuya şu anda ulaşılamıyor. API ve veritabanının çalıştığından emin olup sayfayı yenileyin.
      </Alert>
    );
  }
  return <SetupForm />;
}
