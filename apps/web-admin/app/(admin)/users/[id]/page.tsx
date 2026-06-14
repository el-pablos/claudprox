import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" } },
      apiKeys: { orderBy: { createdAt: "desc" } },
      payments: {
        include: { plan: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      refills: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (user === null) notFound();

  return (
    <div className="space-y-8">
      <header>
        <a href="/users" className="text-xs text-foreground-muted hover:text-ctos-accent">← Daftar user</a>
        <h1 className="mt-2 text-3xl font-bold text-foreground">{user.email}</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Role: <span className="font-mono">{user.role}</span> · Dibuat:{" "}
          {user.createdAt.toLocaleString("id-ID")}
        </p>
      </header>

      <Section title="Langganan">
        <Table
          headers={["Paket", "Status", "Token sisa / total", "Mulai", "Berakhir"]}
          rows={user.subscriptions.map((s) => [
            s.plan.name,
            s.status,
            `${Number(s.tokensRemaining).toLocaleString("id-ID")} / ${Number(s.tokensTotal).toLocaleString("id-ID")}`,
            s.startedAt.toLocaleDateString("id-ID"),
            s.expiresAt.toLocaleDateString("id-ID"),
          ])}
        />
      </Section>

      <Section title="API Key (prefix saja)">
        <Table
          headers={["Prefix", "Aktif", "Dibuat", "Terakhir dipakai"]}
          rows={user.apiKeys.map((k) => [
            `cpx_live_${k.id.slice(0, 8)}`,
            k.isActive ? "Ya" : "Tidak",
            k.createdAt.toLocaleString("id-ID"),
            k.lastUsedAt ? k.lastUsedAt.toLocaleString("id-ID") : "—",
          ])}
        />
      </Section>

      <Section title="Pembayaran">
        <Table
          headers={["Tanggal", "Paket", "Nominal", "Metode", "Status"]}
          rows={user.payments.map((p) => [
            p.createdAt.toLocaleString("id-ID"),
            p.plan.name,
            `Rp${p.amountIdr.toLocaleString("id-ID")}`,
            p.method,
            p.status,
          ])}
        />
      </Section>

      <Section title="Refill">
        <Table
          headers={["Tanggal", "Token nambah", "Hari nambah"]}
          rows={user.refills.map((r) => [
            r.createdAt.toLocaleString("id-ID"),
            Number(r.tokensAdded).toLocaleString("id-ID"),
            String(r.daysAdded),
          ])}
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-md border border-ctos-border bg-ctos-panel p-4 text-sm text-foreground-muted">
        Belum ada data.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-ctos-border">
      <table className="min-w-full divide-y divide-ctos-border text-sm">
        <thead className="bg-ctos-panel/60 text-left text-xs uppercase tracking-wider text-foreground-muted">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ctos-border bg-ctos-bg/40">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 text-foreground-muted">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
