"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <React.Suspense fallback={<LoginFallback />}>
      <LoginInner />
    </React.Suspense>
  );
}

function LoginFallback() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 ctos-grid opacity-40" aria-hidden />
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="text-sm text-foreground-muted">Memuat...</div>
      </div>
    </main>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        setError(body.error?.message ?? "Login gagal");
        return;
      }
      const next = params.get("from") ?? "/";
      router.push(next);
      router.refresh();
    } catch {
      setError("Tidak bisa konek ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 ctos-grid opacity-40" aria-hidden />
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-xl border border-ctos-border bg-ctos-panel p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="font-mono text-sm text-ctos-accent">ClaudProx Dashboard</div>
            <h1 className="ctos-glow mt-2 text-2xl font-bold text-foreground">Masuk</h1>
            <p className="mt-1 text-xs text-foreground-muted">Pakai email dan kata sandi akun kamu.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
              autoComplete="email"
            />
            <Field
              label="Kata sandi"
              type="password"
              value={password}
              onChange={setPassword}
              required
              autoComplete="current-password"
            />
            {error ? (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-ctos-accent px-4 py-2 text-sm font-semibold text-ctos-bg transition hover:bg-ctos-accentDim disabled:opacity-50"
            >
              {loading ? "Masuk..." : "Masuk"}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-foreground-muted">
            Belum punya akun?{" "}
            <a href="/signup" className="text-ctos-accent hover:underline">
              Daftar di sini
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  required,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-foreground-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-md border border-ctos-border bg-ctos-bg px-3 py-2 text-sm text-foreground outline-none focus:border-ctos-accent"
      />
    </label>
  );
}
