import type { Request, Response } from "express";
import { getDb } from "../db/connection.ts";
import type {
  AddExerciseResponse,
  Exercise,
  User,
  UserLogsResponse,
} from "../types/index.ts";
import {
  addExerciseBodySchema,
  getLogsQuerySchema,
} from "../validators/exercises.ts";
import { getValidationErrorMessage } from "../validators/utils.ts";

type DatabaseConnection = Awaited<ReturnType<typeof getDb>>;

async function findUserById(
  db: DatabaseConnection,
  id: string,
): Promise<User | undefined> {
  return db.get<User>("SELECT id, username FROM users WHERE id = ?", id);
}

function buildLogFilters(
  userId: string,
  from?: string,
  to?: string,
): { whereClause: string; params: (string | number)[] } {
  let whereClause = " WHERE user_id = ?";
  const params: (string | number)[] = [userId];

  if (from) {
    whereClause += " AND date >= ?";
    params.push(from);
  }
  if (to) {
    whereClause += " AND date <= ?";
    params.push(to);
  }

  return { whereClause, params };
}

export async function addExercise(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string }; // User ID from the URL parameter
  const parsedBody = addExerciseBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    res
      .status(400)
      .json({ error: getValidationErrorMessage(parsedBody.error.issues) });
    return;
  }
  const { description, duration, date } = parsedBody.data;

  const db = await getDb();
  const user = await findUserById(db, id);
  if (!user) {
    res.status(400).json({ error: "User not found" });
    return;
  }

  // Use provided date or current date in YYYY-MM-DD format.
  const storedDate = date || new Date().toISOString().slice(0, 10);
  const result = await db.run(
    "INSERT INTO exercises (user_id, description, duration, date) VALUES (?, ?, ?, ?)",
    id,
    description,
    duration,
    storedDate,
  );

  const response: AddExerciseResponse = {
    userId: user.id,
    exerciseId: result.lastID as number,
    description,
    duration,
    date: storedDate,
  };

  res.json(response);
}

export async function getLogs(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const parsedQuery = getLogsQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    res
      .status(400)
      .json({ error: getValidationErrorMessage(parsedQuery.error.issues) });
    return;
  }
  const { from, to, limit } = parsedQuery.data;

  const db = await getDb();
  const user = await findUserById(db, id);
  if (!user) {
    res.status(400).json({ error: "User not found" });
    return;
  }

  const { whereClause, params } = buildLogFilters(id, from, to);

  const countResult = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM exercises${whereClause}`,
    ...params,
  );

  let exercisesQuery = `SELECT id, description, duration, date FROM exercises${whereClause}`;
  exercisesQuery += " ORDER BY date ASC";
  const exercisesParams: (string | number)[] = [...params];
  if (limit !== undefined) {
    exercisesQuery += " LIMIT ?";
    exercisesParams.push(limit);
  }

  const exercises = await db.all<Exercise[]>(
    exercisesQuery,
    ...exercisesParams,
  );
  const response: UserLogsResponse = {
    id: user.id,
    username: user.username,
    count: countResult?.count ?? 0,
    logs: exercises,
  };

  res.json(response);
}
