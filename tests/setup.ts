import { afterAll } from "vitest";

process.env.DB_FILENAME = ":memory:";

afterAll(async () => {
  const { closeDb } = await import("../src/db/connection.ts");
  await closeDb();
});
