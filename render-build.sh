#!/usr/bin/env bash
set -euo pipefail

echo "==> Installing pnpm..."
npm install -g pnpm@9

echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo "==> Running database migrations..."
cd packages/database
pnpm run db:migrate
cd ../..

echo "==> Building API..."
pnpm --filter @repo/api build

echo "==> Build complete!"
ls -lh apps/api/dist/
