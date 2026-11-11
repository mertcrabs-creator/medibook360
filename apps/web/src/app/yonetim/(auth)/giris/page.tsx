import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Alert } from "@/components/admin/form";
import { LoginForm } from "@/components/admin/login-form";
import { AuthSkeleton } from "@/components/admin/skeletons";
import { getAdminState, isSetupRequired } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Giriş" };

export default function LoginPage({ searchParams }: PageProps<"/yonetim/giris">) {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <LoginGate searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginGate({ searchParams }: { searchParams: PageProps<"/yonetim/giris">["searchParams"] }) {
  const [setupRequired, state, params] = await Promise.all([isSetupRequired(), getAdminState(), searchParams]);

  if (setupRequired) redirect("/yonetim/kurulum");
  if (state.kind === "ready") redirect("/yonetim");
  if (state.kind === "mfa-enroll") redirect("/yonetim/iki-adimli-dogrulama");

  if (setupRequired === null || state.kind === "unavailable") {
    return (
      <Alert tone="warning">
        Sunucuya şu anda ulaşılamıyor. API ve veritabanının çalıştığından emin olup sayfayı yenileyin.
      </Alert>
    );
  }

  const notice =
    params.neden === "zaman-asimi"
      ? "Uzun süre işlem yapılmadığı için güvenliğiniz adına oturumunuz kapatıldı."
      : params.neden === "cikis"
        ? "Güvenli bir şekilde çıkış yaptınız."
        : undefined;

  return <LoginForm initialStep={state.kind === "mfa-pending" ? "code" : "credentials"} notice={notice} />;
}
