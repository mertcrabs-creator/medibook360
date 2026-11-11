import type { Metadata } from "next";
import { SecurityPage } from "@/components/admin/security-page";

export const metadata: Metadata = { title: "Hesap Güvenliği" };

export default function Page() {
  return <SecurityPage />;
}
