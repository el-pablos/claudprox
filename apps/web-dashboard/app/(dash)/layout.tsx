import { redirect } from "next/navigation";
import { readSession, clearSessionCookie } from "../../lib/auth";

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const session = readSession();
  if (session === null) redirect("/login");
  if (session.role === "ADMIN") {
    // admin pakai web-admin terpisah; redirect untuk hindari cross-role.
    redirect("/login");
  }
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
          <a href="/" className="font-mono text-base text-ctos-accent">ClaudProx</a>
          <nav className="hidden items-center gap-4 text-sm text-slate-300 sm:flex">
            <a href="/" className="hover:text-ctos-accent">Overview</a>
            <a href="/keys" className="hover:text-ctos-accent">API Key</a>
            <a href="/buy" className="hover:text-ctos-accent">Beli / Refill</a>
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

// Tidak dipakai langsung tapi mencegah lint warning unused import bila next-revalidate ditambah.
export const _logoutHelper = clearSessionCookie;
