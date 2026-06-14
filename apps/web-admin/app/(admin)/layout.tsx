import { redirect } from "next/navigation";
import { readAdminSession } from "../../lib/auth";
import { AdminShell } from "../../components/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = readAdminSession();
  if (session === null) redirect("/login");

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
