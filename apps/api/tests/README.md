# API tests

- `unit/` holds isolated module tests.
- `integration/` holds HTTP and Socket.IO tests.
- `helpers/` holds test clients, fixtures, and service setup.
- `setup.ts` restores Vitest mocks after each test.

Run `npm run test --workspace @messaging-app/api` or `npm run test:coverage --workspace @messaging-app/api`.
