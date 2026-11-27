# Messaging App

This project is building persistent direct and group messaging and temporary
guest rooms. The current foundation provides a React scaffold, an Express API,
validated runtime configuration, service health checks and local Compose
setup. Sign-in, chat and guest-room features come in later milestones.

## Run locally with Compose

With Docker and Compose installed, run from the repository root:

```sh
docker compose up --build -d
curl -fsS http://127.0.0.1:8080/health
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080) for the web scaffold.
Only Nginx publishes a host port. Set `MESSAGING_PORT` before startup to use
a different loopback port. MongoDB and Redis stay on the private data network.
Use this command to check API readiness inside the stack:

```sh
docker compose exec -T app node -e 'fetch("http://127.0.0.1:3000/readyz").then(async r => { console.log(r.status, await r.text()); process.exitCode = r.ok ? 0 : 1 })'
```

The API is live while its HTTP server responds. Readiness requires both
MongoDB and Redis to respond. Use `docker compose down` to stop the stack
and keep its MongoDB volume.

## Develop and verify

Use Node.js `24.22.1` (see `.nvmrc`) and npm `12.2.1`. The repository
uses npm workspaces for `apps/api`, `apps/web` and `packages/shared-types`.

```sh
npm ci --ignore-scripts
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Run `npm run dev:web` to start Vite. For custom Vite arguments, run
`npm run dev --workspace @messaging-app/web -- --port 5174 --strictPort`.
For an API development process outside Compose, start local datastores
and supply the [API environment](docs/configuration.md) before running
`npm run dev:api`.

Run `npm run test:watch --workspace @messaging-app/api` and
`npm run test:watch --workspace @messaging-app/web` in separate terminals
to watch both suites. `npm run test:coverage` generates coverage reports.
