# Khan Jewellers

Website for Khan Jewellers — handcrafted gold, silver and pearl jewellery in Rajarhat, Kolkata.

Includes a public showcase site and a password-protected admin panel (billing,
stock, purchase and email promotions).

## Development

You need [Bun](https://bun.sh) (>= 1.3):

```sh
git clone <this-repository-url>
cd <repository-name>
bun install
bun run dev        # http://localhost:8080
```

Quality checks:

```sh
bun run lint       # ESLint (add --fix to auto-fix)
bun run format     # Prettier
bun x tsc --noEmit # typecheck
bun run build      # production build → .output/
```

## Admin panel

- URL: `/admin/login`
- Default credentials: `Admin` / `KJ@2026` — override with `ADMIN_ID` and
  **always set a strong `ADMIN_PASSWORD` in production**.
- Sections:
  - **Billing** — GST tax invoices with live totals, print view, payments
  - **Stock** — tag-wise inventory register
  - **Purchase** — supplier purchase entries
  - **Promotion** — send promotional emails via Resend
- Sessions are HMAC-signed cookies (7 days). Set `SESSION_SECRET` and
  `COOKIE_SECURE=true` behind HTTPS.
- The site runs without a database; billing/stock/purchase gracefully show
  "Database not configured" until `DATABASE_URL` is set.

## Environment variables

Copy `.env.example` to `.env` (local) or fill them in Coolify:

| Variable           | Purpose                                             |
| ------------------ | --------------------------------------------------- |
| `ADMIN_ID`         | Admin login ID (default `Admin`)                    |
| `ADMIN_PASSWORD`   | Admin password (default `KJ@2026` — change it!)     |
| `SESSION_SECRET`   | Cookie signing secret (falls back to password hash) |
| `COOKIE_SECURE`    | `true` for HTTPS deployments                        |
| `DATABASE_URL`     | Neon PostgreSQL connection string                   |
| `RESEND_API_KEY`   | Resend API key for promotion emails                 |
| `RESEND_FROM_EMAIL`| From-address for promotion emails                   |
| `PORT` / `HOST`    | Server bind (defaults `3000` / `0.0.0.0`)           |

## Deployment (Docker / Coolify)

The repo ships a multi-stage `Dockerfile` that builds a Nitro `node-server`
bundle (`.output/server/index.mjs`) and runs it on Node 22.

```sh
docker build -t khan-jewellers .
docker run -p 3000:3000 --env-file .env khan-jewellers
```

On Coolify: create a new resource → GitHub repository → build pack
**Dockerfile** → add the environment variables above → deploy. The health
check endpoint is `/` (returns 200).

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
- Neon (PostgreSQL) · Resend (email)
# khan-jewellers
