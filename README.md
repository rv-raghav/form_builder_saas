# ChaiForms — Form Builder SaaS (tRPC Monorepo)

pnpm + Turborepo monorepo for a hackathon form-builder platform.

**Product requirements:** [docs/PRD.md](./docs/PRD.md)

## What's inside?

### Apps

- **`web`**: Vite + React 19 dashboard — [http://localhost:3000](http://localhost:3000)
- **`@repo/api`**: Express + tRPC + REST auth — [http://localhost:8000](http://localhost:8000)

### Packages

- `@repo/trpc` — shared tRPC router
- `@repo/services` — auth & business logic
- `@repo/database` — Drizzle ORM + Postgres

## Setup

```sh
cp .env.example .env
./setup.sh
docker compose up -d
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Superadmin | `superadmin@demo.com` | `Demo123!` |
| Admin | `admin@demo.com` | `Demo123!` |
| Creator | `creator@demo.com` | `Demo123!` |

## URLs

| Service | URL |
|---------|-----|
| Landing | http://localhost:3000 |
| Explore (public forms) | http://localhost:3000/explore |
| Submissions | http://localhost:3000/submissions |
| Public fill | `http://localhost:3000/f/{slug}` (e.g. `demo-event-rsvp`) |
| API docs (Scalar) | http://localhost:8000/docs |
| OpenAPI JSON | http://localhost:8000/openapi.json |

## Develop

```sh
pnpm dev                 # web + api (not Drizzle Studio)
pnpm db:studio           # Drizzle Studio → https://local.drizzle.studio
pnpm --filter web dev    # frontend only
pnpm --filter @repo/api dev
```

## Auth API (REST)

Cookie-based sessions with CSRF. Endpoints under `/api/auth/*` — see Scalar docs.

## Admin APIs (Phase 2)

| Area | Endpoints |
|------|-----------|
| Users | `GET/POST /api/users/`, `PATCH/DELETE /api/users/:id/`, activate/deactivate |
| Roles | `GET /api/roles/` |
| Access control | `GET /api/access-control/`, toggle page/component per role |
| User overrides | `GET /api/users/:id/effective-permissions/`, permission override CRUD |

**Policy:** Admins manage creators only; Superadmin manages all roles and access-control toggles.

## Forms API (Phase 3)

| Method | Endpoint |
|--------|----------|
| GET | `/api/forms/` |
| POST | `/api/forms/` |
| GET/PATCH/DELETE | `/api/forms/:id/` |
| POST | `/api/forms/:id/publish/`, `unpublish/`, `duplicate/` |

Demo forms (after seed, creator account): `demo-event-rsvp`, `demo-community-signup`, `demo-product-feedback` (all public + published). Sample responses are inserted on first seed when none exist.

## Responses & analytics (Phase 5)

| Method | Endpoint |
|--------|----------|
| GET | `/api/forms/:formId/analytics/` — total count + UTC daily buckets (14 days) |
| GET | `/api/forms/:formId/responses/?page=&page_size=` |
| GET | `/api/forms/:formId/responses/:responseId/` |

**Dashboard:** `/submissions` — form picker, table, chart, response detail modal.

When a **public form** receives a submission, the **owner gets an email** if `SMTP_*` vars are set; otherwise the API logs a dev-friendly notification line (same optional SMTP vars as `/api/password-reset/`).

## Public API (Phase 4)

No authentication. Rate-limited submit endpoint.

| Method | Endpoint |
|--------|----------|
| GET | `/api/public/explore/` — published + **public** visibility only |
| GET | `/api/public/forms/:slug/` — published forms only (public or unlisted) |
| POST | `/api/public/forms/:slug/submit/` — body: `{ answers: { [fieldUuid]: value }, website?: "" }` (honeypot) |

**Rules:** Draft forms → 404 `not_published`. Unlisted forms are hidden from explore but work at `/f/:slug`.
