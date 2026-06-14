"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", icon: <OverviewIcon /> },
  { href: "/users", label: "User", icon: <UsersIcon /> },
  { href: "/payments", label: "Pembayaran", icon: <PaymentsIcon /> },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-border bg-surface md:flex">
        <SidebarContent pathname={pathname} email={email} />
      </aside>

      <div className="md:pl-[240px]">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur md:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka menu navigasi admin"
            aria-expanded={drawerOpen}
            aria-controls="admin-mobile-drawer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:border-border-strong hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <HamburgerIcon />
          </button>
          <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
            ClaudProx{" "}
            <span className="ml-1 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
              ADMIN
            </span>
          </span>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        email={email}
        pathname={pathname}
      />
    </div>
  );
}

function SidebarContent({
  pathname,
  email,
  onNavigate,
}: {
  pathname: string;
  email: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center border-b border-border px-5">
        <span className="font-mono text-base font-semibold tracking-tight text-foreground">
          ClaudProx{" "}
          <span className="ml-1 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
            ADMIN
          </span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Navigasi admin">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex items-center gap-3 rounded-lg bg-primary/15 px-3 py-2.5 text-sm font-medium text-foreground shadow-elev-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              }
            >
              <span className={active ? "text-primary" : "text-foreground-muted"}>
                {item.icon}
              </span>
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="truncate text-xs text-foreground-muted" title={email}>
          {email}
        </p>
        <form action="/api/auth/logout" method="POST" className="mt-3">
          <button
            type="submit"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Keluar
          </button>
        </form>
      </div>
    </>
  );
}

function MobileDrawer({
  open,
  onClose,
  email,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  email: string;
  pathname: string;
}) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const triggerWasFocused = React.useRef<Element | null>(null);

  React.useEffect(() => {
    if (!open) return;

    triggerWasFocused.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || panel === null) return;

      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (first === undefined || last === undefined) return;
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (triggerWasFocused.current instanceof HTMLElement) {
        triggerWasFocused.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="md:hidden">
      <div
        className="fixed inset-0 z-40 bg-overlay"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        id="admin-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi admin"
        className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-border bg-surface shadow-elev-2"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
            ClaudProx{" "}
            <span className="ml-1 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
              ADMIN
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu navigasi admin"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-foreground-muted transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <CloseIcon />
          </button>
        </div>

        <SidebarBody pathname={pathname} email={email} onNavigate={onClose} />
      </div>
    </div>
  );
}

function SidebarBody({
  pathname,
  email,
  onNavigate,
}: {
  pathname: string;
  email: string;
  onNavigate: () => void;
}) {
  return (
    <>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Navigasi admin mobile">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex items-center gap-3 rounded-lg bg-primary/15 px-3 py-3 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  : "flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              }
            >
              <span className={active ? "text-primary" : "text-foreground-muted"}>
                {item.icon}
              </span>
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="truncate text-xs text-foreground-muted" title={email}>
          {email}
        </p>
        <form action="/api/auth/logout" method="POST" className="mt-3">
          <button
            type="submit"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Keluar
          </button>
        </form>
      </div>
    </>
  );
}

function OverviewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
