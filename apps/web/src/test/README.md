# Web tests

- `unit/` holds component and utility tests.
- `integration/` holds routed UI and API interaction tests.
- `helpers/` holds shared render helpers and fixtures.
- `setup.ts` installs jest-dom matchers and cleans up React Testing Library after each test.

Run `npm run test --workspace @messaging-app/web` or `npm run test:coverage --workspace @messaging-app/web`.
