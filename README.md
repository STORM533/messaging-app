# Messaging App

Messaging App is a real-time communication platform for personal and group conversations. People connect with contacts, exchange messages, see presence, and stay up to date with notifications. AI-assisted tools help compose replies and manage conversations.

## Features

- Sign in with an OpenID Connect identity provider.
- Find and manage contacts, then start one-to-one or group conversations.
- Exchange messages in real time and see contact presence.
- Receive notifications and use AI-assisted reply tools.
- Keep sessions and API traffic protected with app-owned token and rate-limit rules.

## Technology

| Area | Technology |
| --- | --- |
| Runtime and language | Node.js 24 LTS, TypeScript, ESM |
| API | Express 5 and Socket.IO |
| Sign-in | OpenID Connect with `openid-client` |
| Sessions and limits | Node.js `crypto` and Redis |
| Application data | MongoDB with Mongoose |
| Background jobs | BullMQ with Redis |
| Web client | React, React Router, Vite, and `socket.io-client` |
| Shared contracts | Local `@messaging-app/shared-types` workspace |

The root package manages the API, web client, and shared-types package as npm workspaces. Dependencies are declared in the workspace that uses them, and the root `package-lock.json` records the full install.

## Repository layout

```text
messaging-app/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── infrastructure/   # MongoDB, Redis, and Socket.IO
│   │   │   ├── middleware/
│   │   │   ├── modules/          # auth, contacts, conversations, messages, etc.
│   │   │   └── shared/
│   │   └── tests/                # unit, integration, and helper tests
│   └── web/
│       └── src/test/             # setup, unit, integration, and helper tests
├── packages/
│   └── shared-types/             # contracts shared by the API and web client
├── package.json                  # workspaces and root commands
└── package-lock.json             # lockfile for all workspaces
```

## Setup

Use Node.js 24 LTS and the npm version bundled with it. Install dependencies from the repository root:

```sh
npm install
```

Start the API and web client in separate terminals:

```sh
npm run dev:api
npm run dev:web
```

The API listens on port `3000` by default. Its health endpoint is `http://localhost:3000/health`. Vite serves the web client on its default development port.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev:api` | Run the API with `tsx` watch mode. |
| `npm run dev:web` | Start the Vite development server. |
| `npm run typecheck` | Typecheck all workspaces, including API tests. |
| `npm run build` | Build each workspace with a build script. |
| `npm run lint` | Lint app and package source. |

Pass `--workspace <name>` to run a workspace command on one package, for example `npm run typecheck --workspace @messaging-app/api`.

## Tests

- `npm test` runs the test scripts across all workspaces. Use it for a combined API and web check.
- `npm run test:watch` keeps Vitest running and reruns tests when files change. Use it while developing tests.
- `npm run test:coverage` runs the suites and reports V8 code coverage. The report shows which code paths tests exercise.
- `npm run test --workspace @messaging-app/api` runs API tests in Node. Use it for backend routes, services, and Socket.IO behavior.
- `npm run test --workspace @messaging-app/web` runs web tests in jsdom. Use it for React components and browser interactions.
