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
  { href: "/keys", label: "API Key", icon: <KeyIcon /> },
  { href: "/buy", label: "Beli / Refill", icon: <CartIcon /> },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({
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
      <DesktopSidebar email={email} pathname={pathname} />

      <div className="md:pl-[240px]">
        <MobileTopBar onOpenMenu={() => setDrawerOpen(true)} menuOpen={drawerOpen} />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
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

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="brand-gradient flex h-9 w-9 items-center justify-center rounded-lg shadow-glow">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F7F7F7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m13 2-3 7h5l-3 7" />
          <circle cx="12" cy="12" r="9" opacity="0.45" />
        </svg>
      </span>
      <span className="font-mono text-base font-semibold tracking-tight text-foreground">ClaudProx</span>
    </div>
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <a
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={[
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        active
          ? "bg-primary/15 text-foreground"
          : "text-foreground-muted hover:bg-surface-hover hover:text-foreground",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-5 w-5 items-center justify-center transition-colors",
          active ? "text-primary" : "text-foreground-muted group-hover:text-foreground",
        ].join(" ")}
        aria-hidden="true"
      >
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      {active ? <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" /> : null}
    </a>
  );
}

function SidebarFooter({ email }: { email: string }) {
  return (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-3 rounded-lg bg-surface-hover px-3 py-2.5">
        <span className="brand-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-foreground">
          {email.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">{email}</p>
          <p className="text-[11px] text-foreground-muted">Akun user</p>
        </div>
      </div>
      <form action="/api/auth/logout" method="POST" className="mt-2">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <LogoutIcon />
          Keluar
        </button>
      </form>
    </div>
  );
}

function DesktopSidebar({ email, pathname }: { email: string; pathname: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 items-center border-b border-border px-5">
        <a
          href="/"
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <BrandMark />
        </a>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Navigasi utama">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>
      <SidebarFooter email={email} />
    </aside>
  );
}

function MobileTopBar({ onOpenMenu, menuOpen }: { onOpenMenu: () => void; menuOpen: boolean }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/85 px-4 backdrop-blur md:hidden">
      <a
        href="/"
        className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <BrandMark />
      </a>
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Buka menu navigasi"
        aria-expanded={menuOpen}
        aria-controls="dashboard-mobile-drawer"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <HamburgerIcon />
      </button>
    </header>
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
      <div className="fixed inset-0 z-40 bg-overlay" aria-hidden="true" onClick={onClose} />
      <div
        ref={panelRef}
        id="dashboard-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,82vw)] flex-col border-r border-border bg-surface shadow-elev-2"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <BrandMark />
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu navigasi"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground-muted transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Navigasi utama mobile">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
              onNavigate={onClose}
            />
          ))}
        </nav>

        <SidebarFooter email={email} />
      </div>
    </div>
  );
}

function OverviewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="m10.7 12.3 8.8-8.8" />
      <path d="m17 5 3 3" />
      <path d="m15 7 2 2" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3h2l2.2 12.4a1.5 1.5 0 0 0 1.5 1.2h8.3a1.5 1.5 0 0 0 1.5-1.2L21 7H6" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17 5 12l5-5" />
      <path d="M5 12h12" />
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
