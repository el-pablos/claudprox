import { redirect } from "next/navigation";
import { readSession } from "../../lib/auth";
import { DashboardNav } from "../../components/DashboardNav";

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const session = readSession();
  if (session === null) redirect("/login");
  if (session.role === "ADMIN") {
    // admin pakai web-admin terpisah; redirect untuk hindari cross-role.
    redirect("/login");
  }
  return (
    <div className="min-h-screen">
      <DashboardNav email={session.email} />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
