import { redirect } from "next/navigation";
import { readAdminSession } from "../../lib/auth";
import { AdminNav } from "../../components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = readAdminSession();
  if (session === null) redirect("/login");

  return (
    <div className="min-h-screen">
      <AdminNav email={session.email} />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
