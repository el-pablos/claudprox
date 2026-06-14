import { redirect } from "next/navigation";
import { readSession } from "../../lib/auth";
import { DashboardShell } from "../../components/DashboardShell";

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const session = readSession();
  if (session === null) redirect("/login");
  if (session.role === "ADMIN") {
    // admin pakai web-admin terpisah; redirect untuk hindari cross-role.
    redirect("/login");
  }
  return <DashboardShell email={session.email}>{children}</DashboardShell>;
}
