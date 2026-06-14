"use client";

import * as React from "react";

export interface UserRow {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  planName: string | null;
  tokensRemaining: string | null;
  expiresAt: string | null;
  requestCount: number;
  keyCount: number;
}

type RoleFilter = "ALL" | "USER" | "ADMIN";
type SortKey = "email" | "request" | "token" | "createdAt";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

export function UsersTable({ users }: { users: UserRow[] }) {
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("ALL");
  const [sortKey, setSortKey] = React.useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = users.filter((u) => {
      const matchEmail = query === "" || u.email.toLowerCase().includes(query);
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchEmail && matchRole;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "email") {
        cmp = a.email.localeCompare(b.email);
      } else if (sortKey === "request") {
        cmp = a.requestCount - b.requestCount;
      } else if (sortKey === "token") {
        const at = a.tokensRemaining === null ? -1 : Number(a.tokensRemaining);
        const bt = b.tokensRemaining === null ? -1 : Number(b.tokensRemaining);
        cmp = at - bt;
      } else {
        cmp = a.createdAt.localeCompare(b.createdAt);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [users, search, roleFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [search, roleFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "email" ? "asc" : "desc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari email..."
            aria-label="Cari user berdasarkan email"
            className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="role-filter" className="text-xs text-foreground-muted">
            Role
          </label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="ALL">Semua</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-foreground-muted">
        Menampilkan {filtered.length === 0 ? 0 : pageStart + 1}
        {"–"}
        {Math.min(pageStart + PAGE_SIZE, filtered.length)} dari {filtered.length} user
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-10 text-center">
          <p className="text-sm text-foreground-muted">Tidak ada user cocok.</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface shadow-elev-1 md:block">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-hover text-left text-xs uppercase tracking-wider text-foreground-muted">
                <tr>
                  <SortableHeader
                    label="Email"
                    active={sortKey === "email"}
                    dir={sortDir}
                    onClick={() => toggleSort("email")}
                  />
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Paket aktif</th>
                  <SortableHeader
                    label="Token sisa"
                    align="right"
                    active={sortKey === "token"}
                    dir={sortDir}
                    onClick={() => toggleSort("token")}
                  />
                  <th className="px-4 py-3">Berakhir</th>
                  <SortableHeader
                    label="Request"
                    align="right"
                    active={sortKey === "request"}
                    dir={sortDir}
                    onClick={() => toggleSort("request")}
                  />
                  <th className="px-4 py-3 text-right">Key</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageRows.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-surface-hover">
                    <td className="px-4 py-3 text-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">{u.planName ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-mono text-primary">
                      {u.tokensRemaining === null
                        ? "—"
                        : Number(u.tokensRemaining).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground-muted">
                      {u.expiresAt === null
                        ? "—"
                        : new Date(u.expiresAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground-muted">
                      {u.requestCount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground-muted">{u.keyCount}</td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`/users/${u.id}`}
                        className="rounded text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        Detail →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {pageRows.map((u) => (
              <div
                key={u.id}
                className="rounded-xl border border-border bg-surface p-4 shadow-elev-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 flex-1 break-all text-sm font-medium text-foreground">
                    {u.email}
                  </span>
                  <RoleBadge role={u.role} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <dt className="text-foreground-muted">Paket</dt>
                    <dd className="text-foreground">{u.planName ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-foreground-muted">Token sisa</dt>
                    <dd className="font-mono text-primary">
                      {u.tokensRemaining === null
                        ? "—"
                        : Number(u.tokensRemaining).toLocaleString("id-ID")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-foreground-muted">Berakhir</dt>
                    <dd className="text-foreground">
                      {u.expiresAt === null
                        ? "—"
                        : new Date(u.expiresAt).toLocaleDateString("id-ID")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-foreground-muted">Request</dt>
                    <dd className="text-foreground">{u.requestCount.toLocaleString("id-ID")}</dd>
                  </div>
                  <div>
                    <dt className="text-foreground-muted">Key</dt>
                    <dd className="text-foreground">{u.keyCount}</dd>
                  </div>
                </dl>
                <div className="mt-3 text-right">
                  <a
                    href={`/users/${u.id}`}
                    className="rounded text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Detail →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Sebelumnya
              </button>
              <span className="text-xs text-foreground-muted">
                Halaman {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Berikutnya
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function SortableHeader({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 rounded uppercase tracking-wider transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          active ? "text-primary" : "text-foreground-muted"
        }`}
      >
        {label}
        <SortIndicator active={active} dir={dir} />
      </button>
    </th>
  );
}

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return <span className="text-foreground-muted/50">↕</span>;
  }
  return <span>{dir === "asc" ? "↑" : "↓"}</span>;
}

function RoleBadge({ role }: { role: UserRow["role"] }) {
  const cls =
    role === "ADMIN"
      ? "bg-accent/15 text-accent"
      : "bg-surface-hover text-foreground-muted";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${cls}`}
    >
      {role}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
