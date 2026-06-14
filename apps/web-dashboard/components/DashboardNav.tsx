"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview" },
  { href: "/keys", label: "API Key" },
  { href: "/buy", label: "Beli / Refill" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ctos-border bg-ctos-panel/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <a href="/" className="font-mono text-base text-ctos-accent">
            ClaudProx
          </a>
          <nav className="hidden items-center gap-4 text-sm text-slate-300 sm:flex" aria-label="Navigasi utama">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={
                  isActive(pathname, item.href)
                    ? "text-ctos-accent"
                    : "text-slate-300 hover:text-ctos-accent"
                }
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="hidden sm:inline">{email}</span>
          <form action="/api/auth/logout" method="POST" className="hidden sm:block">
            <button
              type="submit"
              className="rounded border border-ctos-border px-3 py-1 hover:border-ctos-accent hover:text-ctos-accent"
            >
              Keluar
            </button>
          </form>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Buka menu navigasi"
            aria-expanded={open}
            aria-controls="dashboard-mobile-drawer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ctos-border text-slate-200 hover:border-ctos-accent hover:text-ctos-accent sm:hidden"
          >
            <HamburgerIcon />
          </button>
        </div>
      </div>

      <MobileDrawer
        open={open}
        onClose={() => setOpen(false)}
        email={email}
        pathname={pathname}
      />
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
    <div className="sm:hidden">
      <div
        className="fixed inset-0 z-50 bg-black/60"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        id="dashboard-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        className="fixed inset-y-0 right-0 z-50 flex w-[min(20rem,85vw)] flex-col border-l border-ctos-border bg-ctos-panel shadow-2xl"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between border-b border-ctos-border px-4 py-3">
          <span className="font-mono text-sm text-ctos-accent">ClaudProx</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu navigasi"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ctos-border text-slate-300 hover:border-ctos-accent hover:text-ctos-accent"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3" aria-label="Navigasi utama mobile">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={
                isActive(pathname, item.href)
                  ? "rounded-md bg-ctos-accent/10 px-3 py-3 text-sm font-medium text-ctos-accent"
                  : "rounded-md px-3 py-3 text-sm text-slate-300 hover:bg-ctos-bg hover:text-ctos-accent"
              }
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto border-t border-ctos-border p-4">
          <p className="truncate text-xs text-slate-500">{email}</p>
          <form action="/api/auth/logout" method="POST" className="mt-3">
            <button
              type="submit"
              className="w-full rounded-md border border-ctos-border px-3 py-2 text-sm text-slate-200 hover:border-ctos-accent hover:text-ctos-accent"
            >
              Keluar
            </button>
          </form>
        </div>
      </div>
    </div>
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
