import type { Request, Response } from "express";
import { getDb } from "../db/connection.ts";
import type { User } from "../types/index.ts";
import { createUserBodySchema } from "../validators/users.ts";
import { getValidationErrorMessage } from "../validators/utils.ts";

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  const db = await getDb();
  const users = await db.all<User[]>("SELECT id, username FROM users");
  res.json(users);
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const parsedBody = createUserBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({
      error: getValidationErrorMessage(parsedBody.error.issues),
    });
    return;
  }
  const { username } = parsedBody.data;

  const db = await getDb();
  try {
    const result = await db.run(
      "INSERT INTO users (username) VALUES (?)",
      username,
    );
    res.json({ username, id: result.lastID });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "SQLITE_CONSTRAINT"
    ) {
      res.status(409).json({ error: "Username already exists" });
      return;
    }

    throw error;
  }
}
