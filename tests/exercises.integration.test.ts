import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../src/app.ts";
import { getDb } from "../src/db/connection.ts";

async function resetTables(): Promise<void> {
  const db = await getDb();
  await db.exec("DELETE FROM exercises;");
  await db.exec("DELETE FROM users;");
}

async function createUser(username: string): Promise<number> {
  const response = await request(app)
    .post("/api/users")
    .type("form")
    .send({ username });

  return response.body.id as number;
}

describe("Exercises API", () => {
  beforeEach(async () => {
    await resetTables();
  });

  it("adds exercise for an existing user", async () => {
    const userId = await createUser("alice");

    const response = await request(app)
      .post(`/api/users/${userId}/exercises`)
      .type("form")
      .send({
        description: "Run",
        duration: "45",
        date: "2026-05-10",
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      userId,
      description: "Run",
      duration: 45,
      date: "2026-05-10",
    });
    expect(typeof response.body.exerciseId).toBe("number");
  });

  it("returns 400 when user does not exist", async () => {
    const response = await request(app)
      .post("/api/users/9999/exercises")
      .type("form")
      .send({ description: "Run", duration: 30, date: "2026-05-10" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "User not found" });
  });

  it("returns 400 for invalid exercise payload", async () => {
    const userId = await createUser("bob");

    const response = await request(app)
      .post(`/api/users/${userId}/exercises`)
      .type("form")
      .send({ description: "", duration: "0", date: "2026-02-30" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(typeof response.body.error).toBe("string");
  });

  it("uses current date when date is omitted", async () => {
    const userId = await createUser("carol");

    const response = await request(app)
      .post(`/api/users/${userId}/exercises`)
      .type("form")
      .send({ description: "Swim", duration: 20 });

    expect(response.status).toBe(200);
    expect(response.body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("trims description before saving", async () => {
    const userId = await createUser("trim-user");

    const response = await request(app)
      .post(`/api/users/${userId}/exercises`)
      .type("form")
      .send({ description: "  Bike  ", duration: 25, date: "2026-06-01" });

    expect(response.status).toBe(200);
    expect(response.body.description).toBe("Bike");
  });

  it("returns 400 for too long description", async () => {
    const userId = await createUser("long-desc-user");
    const longDescription = "d".repeat(256);

    const response = await request(app)
      .post(`/api/users/${userId}/exercises`)
      .type("form")
      .send({ description: longDescription, duration: 25, date: "2026-06-01" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Description must be at most 255 characters",
    });
  });

  it("returns 400 for decimal duration", async () => {
    const userId = await createUser("decimal-user");

    const response = await request(app)
      .post(`/api/users/${userId}/exercises`)
      .type("form")
      .send({ description: "Row", duration: "30.5", date: "2026-06-02" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 400 for non-numeric duration", async () => {
    const userId = await createUser("nonnumeric-user");

    const response = await request(app)
      .post(`/api/users/${userId}/exercises`)
      .type("form")
      .send({ description: "Ski", duration: "abc", date: "2026-06-03" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 400 for invalid month in date", async () => {
    const userId = await createUser("bad-date-user");

    const response = await request(app)
      .post(`/api/users/${userId}/exercises`)
      .type("form")
      .send({ description: "Lift", duration: 40, date: "2026-13-01" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("returns logs with filters and limit", async () => {
    const userId = await createUser("dave");

    await request(app)
      .post(`/api/users/${userId}/exercises`)
      .type("form")
      .send({ description: "A", duration: 10, date: "2026-01-01" });
    await request(app)
      .post(`/api/users/${userId}/exercises`)
      .type("form")
      .send({ description: "B", duration: 20, date: "2026-01-10" });
    await request(app)
      .post(`/api/users/${userId}/exercises`)
      .type("form")
      .send({ description: "C", duration: 30, date: "2026-01-20" });

    const response = await request(app)
      .get(`/api/users/${userId}/logs`)
      .query({ from: "2026-01-01", to: "2026-01-31", limit: 2 });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(userId);
    expect(response.body.username).toBe("dave");
    expect(response.body.count).toBe(3);
    expect(response.body.logs).toHaveLength(2);
    expect(response.body.logs.map((log: { description: string }) => log.description)).toEqual([
      "A",
      "B",
    ]);
  });

  it("returns 400 for invalid logs query", async () => {
    const userId = await createUser("eve");

    const response = await request(app)
      .get(`/api/users/${userId}/logs`)
      .query({ limit: -1 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 400 for logs when user does not exist", async () => {
    const response = await request(app)
      .get("/api/users/12345/logs")
      .query({ from: "2026-01-01" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "User not found" });
  });

  it("returns empty logs for existing user with no exercises", async () => {
    const userId = await createUser("frank");

    const response = await request(app).get(`/api/users/${userId}/logs`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(userId);
    expect(response.body.username).toBe("frank");
    expect(response.body.count).toBe(0);
    expect(response.body.logs).toEqual([]);
  });

  it("accepts large limit and keeps response shape", async () => {
    const userId = await createUser("grace");

    await request(app)
      .post(`/api/users/${userId}/exercises`)
      .type("form")
      .send({ description: "Only", duration: 15, date: "2026-02-01" });

    const response = await request(app)
      .get(`/api/users/${userId}/logs`)
      .query({ limit: 1000 });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(userId);
    expect(response.body.username).toBe("grace");
    expect(response.body.count).toBe(1);
    expect(response.body.logs).toHaveLength(1);
    expect(response.body.logs[0]).toMatchObject({
      description: "Only",
      duration: 15,
      date: "2026-02-01",
    });
  });

});
