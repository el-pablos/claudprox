"use client";

import * as React from "react";
import { clsx } from "clsx";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={clsx(
          "relative h-[85vh] w-full overflow-y-auto rounded-t-2xl border border-ctos-border bg-ctos-panel shadow-2xl",
          "sm:h-auto sm:max-h-[80vh] sm:max-w-2xl sm:rounded-2xl",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-ctos-border bg-ctos-panel/95 px-6 py-4 backdrop-blur">
          <h2 className="text-lg font-semibold text-ctos-accent">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-ctos-border px-3 py-1 text-sm text-slate-300 hover:border-ctos-accent hover:text-ctos-accent"
            aria-label="Tutup dialog"
          >
            Tutup
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative group">
      <pre className="overflow-x-auto rounded-md border border-ctos-border bg-ctos-bg p-4 text-xs font-mono text-slate-200">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={onCopy}
        className="absolute right-2 top-2 rounded border border-ctos-border bg-ctos-panel px-2 py-1 text-xs text-ctos-accent opacity-0 transition group-hover:opacity-100 hover:bg-ctos-bg"
        aria-label="Salin perintah"
      >
        {copied ? "Tersalin" : "Salin"}
      </button>
    </div>
  );
}
