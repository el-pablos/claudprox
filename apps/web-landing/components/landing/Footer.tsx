export function Footer() {
  return (
    <footer className="border-t border-ctos-border bg-ctos-bg">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="font-mono text-lg text-ctos-accent">TamsHub ClaudProx</div>
            <p className="mt-2 text-sm text-foreground-muted">
              Gateway reseller proxy AI dengan metering token, durasi, sama refill mulus.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-foreground-muted">Produk</h4>
            <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
              <li>
                <a href="/" className="hover:text-ctos-accent">
                  Beranda
                </a>
              </li>
              <li>
                <a href="/pricing" className="hover:text-ctos-accent">
                  Paket harga
                </a>
              </li>
              <li>
                <a href="/docs" className="hover:text-ctos-accent">
                  Dokumentasi
                </a>
              </li>
              <li>
                <a href="/#cli" className="hover:text-ctos-accent">
                  Daftar CLI
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-foreground-muted">Pembayaran</h4>
            <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
              <li>QRIS</li>
              <li>BCA</li>
              <li>Virtual Account</li>
              <li className="text-xs text-foreground-muted">
                Konfirmasi manual via Telegram admin.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-foreground-muted">Kontak</h4>
            <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
              <li>
                Telegram:{" "}
                <a
                  href="https://t.me/ImTamaa"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ctos-accent hover:underline"
                >
                  t.me/ImTamaa
                </a>
              </li>
              <li>
                Email:{" "}
                <a
                  href="mailto:admin@tams.codes"
                  className="text-ctos-accent hover:underline"
                >
                  admin@tams.codes
                </a>
              </li>
              <li>
                GitHub:{" "}
                <a
                  href="https://github.com/el-pablos"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ctos-accent hover:underline"
                >
                  github.com/el-pablos
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-ctos-border pt-6 text-xs text-foreground-muted sm:flex-row">
          <span>© 2026 TamsHub ClaudProx. All rights reserved.</span>
          <span className="font-mono">v1.0 — built with Next.js 14 sama Fastify</span>
        </div>
      </div>
    </footer>
  );
}
