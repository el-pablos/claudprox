#!/bin/bash
# firewall-cloudflare.sh — Proteksi DDoS L3/L4 untuk origin ClaudProx.
#
# Allow inbound 80/443 HANYA dari rentang IP Cloudflare (di-fetch live dari
# cloudflare.com/ips-v4 + ips-v6). SSH (22) tetap terbuka anti-lockout.
# Port app (4015-4018) + MySQL (3306) tertutup dari luar — hanya via nginx loopback.
#
# Tanpa ini, attacker yang tahu IP origin bisa DDoS langsung melewati Cloudflare.
# Nginx return 444 hanya L7 (terima TCP lalu drop) — TIDAK cukup untuk volumetrik.
#
# Pakai: bash deploy/firewall-cloudflare.sh   (di server, sebagai root)
# Verifikasi dari luar: curl http://<ORIGIN_IP>/ harus TIMEOUT (bukan 444/200).

set -euo pipefail

log() { printf '\n=== %s ===\n' "$1"; }

log "Ambil rentang IP Cloudflare resmi"
# Fetch + validasi PENUH sebelum menyentuh ufw. Kalau fetch gagal atau body
# bukan daftar CIDR valid (mis. HTML error page dengan HTTP 200), script exit
# TANPA pernah me-reset firewall -> anti lock-out / anti partial-outage.
CF_V4=$(curl -fsS -m 15 https://www.cloudflare.com/ips-v4 || true)
CF_V6=$(curl -fsS -m 15 https://www.cloudflare.com/ips-v6 || true)
CF_V4_COUNT=$(echo "$CF_V4" | grep -cE '^([0-9]{1,3}\.){3}[0-9]{1,3}/[0-9]{1,2}$')
CF_V6_COUNT=$(echo "$CF_V6" | grep -cE '^[0-9a-fA-F:]+/[0-9]{1,3}$')
# Cloudflare publikasikan ~15 range v4 + ~7 range v6. Ambang minimum menangkap
# respons ter-truncate (mis. hanya 1-2 baris terkirim) supaya firewall TIDAK
# di-reset dengan daftar range tidak lengkap -> anti partial-outage.
if [ "$CF_V4_COUNT" -lt 7 ]; then
  echo "GAGAL/INVALID IPv4 Cloudflare (cuma $CF_V4_COUNT range, minimal 7), abort (firewall TIDAK diubah)"; exit 1
fi
if [ "$CF_V6_COUNT" -lt 3 ]; then
  echo "GAGAL/INVALID IPv6 Cloudflare (cuma $CF_V6_COUNT range, minimal 3), abort (firewall TIDAK diubah)"; exit 1
fi
echo "v4: $(echo "$CF_V4" | wc -l) ranges, v6: $(echo "$CF_V6" | wc -l) ranges"

log "Reset ufw ke baseline deny-incoming"
ufw --force reset >/dev/null 2>&1
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null

log "Allow SSH (22) DULU — anti-lockout"
ufw allow 22/tcp >/dev/null

log "Allow 80/443 HANYA dari Cloudflare (v4 + v6)"
for ip in $CF_V4 $CF_V6; do
  ufw allow from "$ip" to any port 80 proto tcp >/dev/null
  ufw allow from "$ip" to any port 443 proto tcp >/dev/null
done

log "Enable ufw"
ufw --force enable >/dev/null

log "Status"
ufw status verbose | head -12
echo "total rules: $(ufw status numbered | grep -c '\[')"
echo "DONE_FIREWALL"
