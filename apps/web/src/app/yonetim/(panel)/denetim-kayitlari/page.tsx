import type { Metadata } from "next";
import { AuditPage } from "@/components/admin/audit-page";

export const metadata: Metadata = { title: "Denetim Kayıtları" };

export default function Page() {
  return <AuditPage />;
}
