import { describe, expect, it } from "vitest";
import { loadEnv } from "../../src/config/env.js";

const local = {
  MONGODB_URI: "mongodb://127.0.0.1:27017/messaging_app",
  REDIS_URL: "redis://127.0.0.1:6379/0",
};

describe("loadEnv", () => {
  it("loads local defaults and ignores unrelated process environment", () => {
    expect(loadEnv({ ...local, EXTRA: "ignored" })).toEqual({
      ...local,
      NODE_ENV: "development",
      PORT: 3000,
    });
    expect(
      loadEnv({ ...local, NODE_ENV: "production", PORT: "8080" }).PORT,
    ).toBe(8080);
  });

  it.each(["", "0", "65536", "3.5", " 3000", "1e3"])(
    "rejects invalid port %j",
    (PORT) => {
      expect(() => loadEnv({ ...local, PORT })).toThrow(
        "Invalid API environment: PORT",
      );
    },
  );

  it("accepts a Mongo seed list and a TLS Redis URL", () => {
    const remote = {
      MONGODB_URI: "mongodb://a:27017,b:27017/messaging_app?replicaSet=rs0",
      REDIS_URL: "rediss://cache.example.test:6380/1",
    };
    expect(loadEnv(remote)).toMatchObject(remote);
  });

  it("reports missing and invalid settings using field names only", () => {
    expect(() =>
      loadEnv({
        NODE_ENV: "unknown",
        MONGODB_URI: "https://fixture:private-marker@example.test",
        REDIS_URL: "redis://localhost/not-a-db",
      }),
    ).toThrow(/^Invalid API environment: NODE_ENV, MONGODB_URI, REDIS_URL$/);
    expect(() => loadEnv({})).toThrow(
      /^Invalid API environment: MONGODB_URI, REDIS_URL$/,
    );
  });
});
