import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../src/app.ts";
import { getDb } from "../src/db/connection.ts";

async function resetTables(): Promise<void> {
  const db = await getDb();
  await db.exec("DELETE FROM exercises;");
  await db.exec("DELETE FROM users;");
}

describe("Users API", () => {
  beforeEach(async () => {
    await resetTables();
  });

  it("creates a user", async () => {
    const response = await request(app)
      .post("/api/users")
      .type("form")
      .send({ username: "alice" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ username: "alice" });
    expect(typeof response.body.id).toBe("number");
  });

  it("returns 400 when username is empty", async () => {
    const response = await request(app)
      .post("/api/users")
      .type("form")
      .send({ username: "   " });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Username is required" });
  });

  it("returns 409 for duplicate username (case-insensitive)", async () => {
    await request(app).post("/api/users").type("form").send({ username: "Bob" });

    const duplicateResponse = await request(app)
      .post("/api/users")
      .type("form")
      .send({ username: "bob" });

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body).toEqual({ error: "Username already exists" });
  });

  it("returns all created users", async () => {
    await request(app).post("/api/users").type("form").send({ username: "anna" });
    await request(app).post("/api/users").type("form").send({ username: "max" });

    const response = await request(app).get("/api/users");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
    expect(response.body.map((u: { username: string }) => u.username).sort()).toEqual([
      "anna",
      "max",
    ]);
  });

  it("trims username before saving", async () => {
    const response = await request(app)
      .post("/api/users")
      .type("form")
      .send({ username: "  kate  " });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ username: "kate" });
  });

  it("rejects a username longer than 50 characters", async () => {
    const longUsername = "u".repeat(300);

    const response = await request(app)
      .post("/api/users")
      .type("form")
      .send({ username: longUsername });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Username must be at most 50 characters",
    });
  });
});
