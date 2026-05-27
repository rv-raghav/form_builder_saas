#!/usr/bin/env bash
set -euo pipefail

echo "==> Installing pnpm..."
npm install -g pnpm@9

echo "==> Installing dependencies (including devDependencies for build tools)..."
# Force NODE_ENV=development during install so pnpm doesn't skip devDependencies
# (drizzle-kit is a devDependency needed for migrations)
NODE_ENV=development pnpm install --frozen-lockfile

echo "==> Running database migrations..."
# Run drizzle-kit directly (env vars like DATABASE_URL are provided by Render)
cd packages/database
npx drizzle-kit migrate
cd ../..

echo "==> Building API..."
pnpm --filter @repo/api build

echo "==> Build complete!"
ls -lh apps/api/dist/
