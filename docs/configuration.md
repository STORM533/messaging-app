# API configuration

The API validates its process environment before starting. Supply secrets through
the runtime environment. Local environment files are ignored by Git, and
`.env.example` provides blank placeholders for connection strings.

| Variable | M0 behavior |
| --- | --- |
| `NODE_ENV` | `development`, `test` or `production`. Defaults to `development`. |
| `PORT` | API listening port. Decimal integer from 1 through 65535. Defaults to 3000. |
| `MONGODB_URI` | Required MongoDB connection string for the selected database. |
| `REDIS_URL` | Required Redis URL using `redis:` or `rediss:`. |

Compose provides internal service URLs to the API. For direct development, set
the environment variables before running `npm run dev:api`, or populate an
ignored `.env` and use Node's explicit env-file startup from the repository
root:

```sh
node --env-file=.env --watch --import tsx apps/api/src/server.ts
```

If a variable is present in both the process environment and the file, the
process environment takes precedence. Invalid settings are reported by field
name. OIDC, JWT, guest-room, rate-limit and metrics settings belong to later
milestones and are not required to start M0.
