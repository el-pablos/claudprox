import { redirect } from "next/navigation";
import { readAdminSession } from "../../lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = readAdminSession();
  if (session === null) redirect("/login");

  return (
    <div className="min-h-screen">
      <TopBar email={session.email} />
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}

function TopBar({ email }: { email: string }) {
  return (
    <header className="border-b border-ctos-border bg-ctos-panel/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <a href="/" className="font-mono text-base text-ctos-accent">
            ClaudProx <span className="text-xs uppercase tracking-wider text-red-400/70">[ADMIN]</span>
          </a>
          <nav className="hidden items-center gap-4 text-sm text-slate-300 sm:flex">
            <a href="/" className="hover:text-ctos-accent">Overview</a>
            <a href="/users" className="hover:text-ctos-accent">User</a>
            <a href="/payments" className="hover:text-ctos-accent">Pembayaran</a>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="hidden sm:inline">{email}</span>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="rounded border border-ctos-border px-3 py-1 hover:border-ctos-accent hover:text-ctos-accent"
            >
              Keluar
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
