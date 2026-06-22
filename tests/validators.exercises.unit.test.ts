import { describe, expect, it } from "vitest";
import {
  addExerciseBodySchema,
  getLogsQuerySchema,
} from "../src/validators/exercises.ts";

describe("Exercise validators", () => {
  it("accepts a valid add-exercise payload", () => {
    const parsed = addExerciseBodySchema.safeParse({
      description: "Run",
      duration: "30",
      date: "2026-01-15",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.duration).toBe(30);
      expect(parsed.data.date).toBe("2026-01-15");
    }
  });

  it("rejects an empty description", () => {
    const parsed = addExerciseBodySchema.safeParse({
      description: "   ",
      duration: 10,
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects too long description", () => {
    const parsed = addExerciseBodySchema.safeParse({
      description: "d".repeat(256),
      duration: 10,
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects non-positive duration", () => {
    const parsed = addExerciseBodySchema.safeParse({
      description: "Walk",
      duration: 0,
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects decimal duration", () => {
    const parsed = addExerciseBodySchema.safeParse({
      description: "Walk",
      duration: "30.5",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects non-numeric duration", () => {
    const parsed = addExerciseBodySchema.safeParse({
      description: "Walk",
      duration: "abc",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const parsed = addExerciseBodySchema.safeParse({
      description: "Walk",
      duration: 10,
      date: "15-01-2026",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects non-existent calendar date", () => {
    const parsed = addExerciseBodySchema.safeParse({
      description: "Walk",
      duration: 10,
      date: "2026-02-30",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects invalid month in date", () => {
    const parsed = addExerciseBodySchema.safeParse({
      description: "Walk",
      duration: 10,
      date: "2026-13-01",
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts valid logs query values", () => {
    const parsed = getLogsQuerySchema.safeParse({
      from: "2026-01-01",
      to: "2026-01-31",
      limit: "2",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.limit).toBe(2);
    }
  });

  it("rejects invalid logs limit", () => {
    const parsed = getLogsQuerySchema.safeParse({ limit: "-5" });

    expect(parsed.success).toBe(false);
  });
});
