# Samstöðin Áskriftir

- Drizzle
- Turso
- Next.js App Router w/ server actions
- ... that's it! Super simple stack. No react-query or tRPC.

## Development

The local stack expects a Cloudflare tunnel with ingress rules likes this:

```yaml
tunnel: <UUID>
credentials-file: /Users/jokull/.cloudflared/<UUID>.json
ingress:
  - hostname: samstodin-subs.solberg.is
    service: http://localhost:3800
  - service: http_status:404
```

```bash
bun install
bun run tunnel
bun run dev  # in another tab
```

Template `.env.local`

```
EXTERNAL_HOST="samstodin-subs.solberg.is"

SESSION_SECRET=

DATABASE_URL=libsql://samstodin-subs-jokull.turso.io
DATABASE_AUTH_TOKEN=

ASKELL_PUBLIC=
ASKELL_PRIVATE=
ASKELL_WEBHOOKS_HMAC_SECRET=

SAMSTODIN_EMAIL_ADDRESS="askrift@samstodin.is"
SAMSTODIN_EMAIL_PASSWORD=
```

## Production

Initialize the production db

```
# signup with turso, install the turso cli
turso db create samstodin-subs --from-dump seed.sql
turso db show --url samstodin-subs  # for the prod `DATABASE_URL` value
turso tokens create samstodin-subs  # for the prod `DATABASE_AUTH_TOKEN` value
```
