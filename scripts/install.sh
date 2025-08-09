#!/usr/bin/env bash
set -euo pipefail

# Journey Timeline automated setup script
# OS: macOS / Shell: zsh-compatible

cyan='\033[0;36m'; green='\033[0;32m'; yellow='\033[1;33m'; red='\033[0;31m'; nc='\033[0m'

say() { echo -e "${cyan}➤${nc} $1"; }
ok() { echo -e "${green}✔${nc} $1"; }
warn() { echo -e "${yellow}⚠${nc} $1"; }
fail() { echo -e "${red}✖${nc} $1"; exit 1; }

# Resolve repo root (script lives in scripts/install.sh)
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

say "Journey Timeline setup starting…"

# 1) Check Node.js
if ! command -v node >/dev/null 2>&1; then
  fail "Node.js is required. Install Node 18+ from https://nodejs.org/ and re-run this script."
fi
NODE_VER=$(node -v || true)
NODE_MAJ="${NODE_VER#v}"; NODE_MAJ="${NODE_MAJ%%.*}"
if [[ -n "$NODE_MAJ" && "$NODE_MAJ" -lt 18 ]]; then
  warn "Detected Node $NODE_VER. Node 18+ is recommended."
fi
ok "Node present: $NODE_VER"

# 2) Ensure .env with DATABASE_URL
if [[ ! -f .env ]]; then
  say "Creating .env with SQLite DATABASE_URL…"
  cat > .env <<'EOF'
DATABASE_URL="file:./dev.db"
EOF
  ok ".env created"
else
  if ! grep -q '^DATABASE_URL=' .env; then
    say "Adding DATABASE_URL to existing .env…"
    echo 'DATABASE_URL="file:./dev.db"' >> .env
    ok "DATABASE_URL added"
  else
    ok ".env present"
  fi
fi

# 3) Install npm packages
say "Installing npm dependencies…"
npm install
ok "Dependencies installed"

# 4) Prisma database setup (migrations)
say "Setting up database via Prisma…"
if npx prisma migrate dev --name init; then
  ok "Prisma migrate completed"
else
  warn "Prisma migrate failed, attempting prisma generate (useful if DB already initialized)…"
  npx prisma generate
  ok "Prisma client generated"
fi

say "All set!"
echo ""
echo -e "${green}Next steps:${nc}"
echo "  1) Start the dev server: npm run dev"
echo "  2) Open http://localhost:3000"
echo ""
echo -e "${yellow}Tips:${nc}"
echo "  • Use 'npx prisma studio' to inspect the DB"
echo "  • Re-run this script after pulling major changes"
