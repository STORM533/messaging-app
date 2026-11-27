import { gzipSync } from "node:zlib";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/app.js";
import { createReadiness } from "../../src/infrastructure/readiness.js";

describe("foundation health and request logs", () => {
  it("keeps liveness separate and tracks each dependency through recovery", async () => {
    const mongo = vi.fn(async () => true);
    const redis = vi.fn(async () => true);
    const app = createApp({
      isReady: createReadiness(mongo, redis),
      writeRequestLog() {},
    });
    await request(app).get("/healthz").expect(200, { status: "ok" });
    expect(mongo).not.toHaveBeenCalled();
    expect(redis).not.toHaveBeenCalled();
    await request(app).get("/readyz").expect(200, { status: "ready" });
    mongo.mockRejectedValueOnce(new Error("fixture detail"));
    await request(app).get("/readyz").expect(503, { status: "not_ready" });
    redis.mockResolvedValueOnce(false);
    await request(app).get("/readyz").expect(503, { status: "not_ready" });
    await request(app).get("/readyz").expect(200, { status: "ready" });
  });

  it("correlates a request without logging untrusted URLs, IDs, headers or bodies", async () => {
    const writeRequestLog = vi.fn();
    const app = createApp({ isReady: async () => true, writeRequestLog });
    const response = await request(app)
      .get("/readyz?token=fixture-query")
      .set("Authorization", "Bearer fixture-token")
      .set("Cookie", "session=fixture-cookie")
      .set("X-Request-Id", "fixture-id")
      .expect(200);
    const requestId = response.headers["x-request-id"];
    expect(requestId).toMatch(/^[a-f0-9-]{36}$/);
    expect(writeRequestLog).toHaveBeenCalledWith({
      event: "http_request",
      requestId,
      method: "GET",
      route: "/readyz",
      status: 200,
      durationMs: expect.any(Number),
    });

    await request(app)
      .post("/fixture-path")
      .set("Content-Type", "application/json")
      .send('{"message": fixture-body}')
      .expect(400, { status: "invalid_request" });
    await request(app)
      .post("/fixture-path")
      .set("Content-Type", "application/json")
      .set("Content-Encoding", "gzip")
      .send(gzipSync(JSON.stringify({ message: "fixture-body" })))
      .expect(415, { status: "invalid_request" });
    expect(JSON.stringify(writeRequestLog.mock.calls)).not.toContain("fixture");
  });

  it("bounds concurrent readiness calls without queuing more datastore commands", async () => {
    vi.useFakeTimers();
    try {
      let settle: (ready: boolean) => void = () => {};
      const pending = new Promise<boolean>((resolve) => {
        settle = resolve;
      });
      const mongo = vi.fn(async () => true);
      const redis = vi.fn(() => pending);
      const isReady = createReadiness(mongo, redis, 20);
      const checks = Promise.all([isReady(), isReady()]);
      await vi.advanceTimersByTimeAsync(20);
      await expect(checks).resolves.toEqual([false, false]);
      expect(redis).toHaveBeenCalledTimes(1);
      settle(true);
      await vi.advanceTimersByTimeAsync(0);
      await expect(isReady()).resolves.toBe(true);
      expect(redis).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });
});
