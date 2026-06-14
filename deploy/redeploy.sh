#!/bin/bash
# redeploy.sh — All-in-one redeploy ClaudProx di server produksi.
#
# Pakai: dari /root/work/claudprox di server, jalankan:
#   bash deploy/redeploy.sh
#
# Alur: pull master -> install deps -> prisma generate -> build packages ->
#       build gateway + 3 web app -> restart PM2 -> reload nginx -> smoke test.
# Idempoten dan aman: tidak menyentuh DNS, tidak menerbitkan ulang SSL,
# tidak menghapus data. Hanya menyegarkan kode + proses.

set -euo pipefail

PROJECT_DIR="/root/work/claudprox"
DB_PASS_FILE="$PROJECT_DIR/.env"

cd "$PROJECT_DIR"

log() { printf '\n\033[1;36m=== %s ===\033[0m\n' "$1"; }
ok()  { printf '\033[1;32m[OK]\033[0m %s\n' "$1"; }
err() { printf '\033[1;31m[ERR]\033[0m %s\n' "$1"; }

export NODE_ENV=production

log "STEP 1/8 — Git pull master"
git fetch origin master
git reset --hard origin/master
COMMIT=$(git log --oneline -1)
ok "HEAD: $COMMIT"

log "STEP 2/8 — pnpm install (frozen lockfile)"
pnpm install --frozen-lockfile 2>&1 | tail -3 || pnpm install 2>&1 | tail -3
ok "dependencies terpasang"

log "STEP 3/8 — Prisma generate"
pnpm prisma generate 2>&1 | tail -2
ok "prisma client ter-generate"

log "STEP 4/8 — Build shared packages (wajib sebelum web app)"
pnpm --filter @claudprox/shared build 2>&1 | tail -2
pnpm --filter @claudprox/server build 2>&1 | tail -2
test -f packages/shared/dist/index.js || { err "shared/dist hilang"; exit 1; }
test -f packages/server/dist/index.js || { err "server/dist hilang"; exit 1; }
ok "shared + server dist siap"

log "STEP 5/8 — Build gateway (tsc)"
( cd apps/gateway && pnpm exec tsc -p tsconfig.json )
test -f apps/gateway/dist/server.js || { err "gateway/dist/server.js hilang"; exit 1; }
ok "gateway dist siap"

log "STEP 6/8 — Build 3 web app (next build)"
( cd apps/web-landing && pnpm exec next build 2>&1 | tail -3 )
( cd apps/web-dashboard && pnpm exec next build 2>&1 | tail -3 )
( cd apps/web-admin && pnpm exec next build 2>&1 | tail -3 )
ok "web-landing + web-dashboard + web-admin ter-build"

log "STEP 7/8 — Restart PM2 (gateway delete+start fresh, web restart)"
# Gateway: delete + start fresh supaya muat ENV + dist terbaru (hindari stale state).
pm2 delete claudprox-gateway 2>/dev/null || true
pkill -f "apps/gateway/dist/server.js" 2>/dev/null || true
sleep 2
pm2 start ecosystem.config.js --only claudprox-gateway --env production 2>&1 | grep -E 'launched|error' || true
# Web app: restart cukup (next start re-baca .next build baru).
pm2 restart claudprox-web-landing claudprox-web-dashboard claudprox-web-admin 2>&1 | grep -E 'restart|online' || true
pm2 save 2>&1 | tail -1
sleep 6
ok "PM2 selesai restart"

log "STEP 8/8 — Reload nginx + smoke test origin"
nginx -t && systemctl reload nginx && ok "nginx reload OK"

PASS=0; FAIL=0
check() {
  local name="$1" port="$2" path="$3" expect="$4"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 20 -H "Host: ${name}" "http://127.0.0.1:${port}${path}" 2>&1)
  if [ "$code" = "$expect" ]; then ok "${name}${path} -> ${code}"; PASS=$((PASS+1));
  else err "${name}${path} -> ${code} (harap ${expect})"; FAIL=$((FAIL+1)); fi
}
check "api-claudprox.tams.codes"       4015 "/health"     200
check "api-claudprox.tams.codes"       4015 "/v1/models"  401
check "claudprox.tams.codes"           4016 "/"           200
check "dashboard-claudprox.tams.codes" 4017 "/login"      200
check "admin-claudprox.tams.codes"     4018 "/login"      200

log "RINGKASAN"
echo "PM2 status:"
pm2 list 2>/dev/null | grep -E 'claudprox' | grep -v -E 'test-gw' || true
echo ""
if [ "$FAIL" -eq 0 ]; then
  ok "REDEPLOY SELESAI — ${PASS}/5 smoke test lulus. Commit: ${COMMIT}"
  exit 0
else
  err "REDEPLOY SELESAI DENGAN ${FAIL} smoke test GAGAL — cek log: pm2 logs"
  exit 1
fi
