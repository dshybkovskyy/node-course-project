import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.ts";

describe("App smoke tests", () => {
  it("serves index page", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/text\/html/);
  });
});
