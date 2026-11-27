import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

describe("GET /health", () => {
  it("returns the public health response as JSON", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.headers["content-type"]).toMatch(/^application\/json\b/);
    expect(response.body).toEqual({ status: "ok" });
  });
});
