import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";

const app = createApp({ isReady: async () => false, writeRequestLog() {} });

describe("GET /health", () => {
  it("returns the public health response as JSON", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.headers["content-type"]).toMatch(/^application\/json\b/);
    expect(response.body).toEqual({ status: "ok" });
  });
});
