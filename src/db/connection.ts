import sqlite3 from "sqlite3";
import { open, type Database } from "sqlite";
import { applySchema } from "./schema.ts";

export type DB = Database<sqlite3.Database, sqlite3.Statement>;

let dbInstance: DB | null = null;

function resolveDbFilename(): string {
  const fromEnv = process.env.DB_FILENAME?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : "./database.db";
}

export async function getDb(): Promise<DB> {
  if (dbInstance) return dbInstance;

  const db = await open({
    filename: resolveDbFilename(),
    driver: sqlite3.Database,
  });

  await applySchema(db);

  dbInstance = db;
  return dbInstance;
}

export async function closeDb(): Promise<void> {
  if (!dbInstance) return;

  await dbInstance.close();
  dbInstance = null;
}
