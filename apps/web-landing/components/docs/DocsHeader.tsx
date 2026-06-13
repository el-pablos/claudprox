export function DocsHeader() {
  return (
    <nav className="sticky top-0 z-40 border-b border-ctos-border bg-ctos-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 text-sm">
        <a href="/" className="font-mono text-ctos-accent">
          ClaudProx
        </a>
        <div className="flex items-center gap-5 text-slate-300">
          <a href="/docs" className="hover:text-ctos-accent">Docs</a>
          <a href="/pricing" className="hover:text-ctos-accent">Harga</a>
          <a href="https://dashboard.claudprox.tams.codes" className="hover:text-ctos-accent">Masuk</a>
        </div>
      </div>
    </nav>
  );
}
