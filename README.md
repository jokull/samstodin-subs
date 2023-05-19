# Samstöðin Subs

Áskriftarkerfi smíðað ofan á Áskel frá Overcast.

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

![The Remix Indie Stack](https://repository-images.githubusercontent.com/465928257/a241fa49-bd4d-485a-a2a5-5cb8e4ee0abf)

Hosted on Fly.io
