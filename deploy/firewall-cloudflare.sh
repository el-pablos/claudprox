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
CF_V4=$(curl -fsS -m 15 https://www.cloudflare.com/ips-v4)
CF_V6=$(curl -fsS -m 15 https://www.cloudflare.com/ips-v6)
if [ -z "$CF_V4" ]; then echo "GAGAL ambil IP Cloudflare, abort (tidak mengubah firewall)"; exit 1; fi
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
