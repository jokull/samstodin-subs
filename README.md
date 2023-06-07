# Samstöðin Subs

Áskriftarkerfi smíðað ofan á Áskel frá Overcast.

Development

```bash
pnpm tunnel
pnpm dev
```

SQLite console:

```bash
fly ssh issue --agent
fly ssh console -C database-cli
```

`.env` fællinn

```
DATABASE_URL="file:./data.db?connection_limit=1"
SESSION_SECRET=""
ASKELL_PUBLIC=""
ASKELL_PRIVATE=""
ASKELL_WEBHOOKS_HMAC_SECRET=""
EXTERNAL_HOST="samstodin-subs.solberg.is"
SAMSTODIN_EMAIL_ADDRESS="askrift@samstodin.is"
SAMSTODIN_EMAIL_PASSWORD=""
```

Jökull er með þessi gildi.

## Stack

[The Remix Indie Stack](https://github.com/remix-run/indie-stack)

Hosted on Fly.io
