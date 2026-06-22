import { z } from "zod";

const MAX_DESCRIPTION_LENGTH = 255;

const isoDateSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Date must be in YYYY-MM-DD format",
  )
  .refine(
    (value) => {
      if (!value) return true;
      const [yearStr, monthStr, dayStr] = value.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr);
      const day = Number(dayStr);
      const parsed = new Date(Date.UTC(year, month - 1, day));

      return (
        parsed.getUTCFullYear() === year &&
        parsed.getUTCMonth() === month - 1 &&
        parsed.getUTCDate() === day
      );
    },
    "Date must be a real calendar date",
  );

export const addExerciseBodySchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`,
    ),
  duration: z.coerce.number().int().positive("Duration must be a positive integer"),
  date: isoDateSchema,
});

export const getLogsQuerySchema = z.object({
  from: isoDateSchema,
  to: isoDateSchema,
  limit: z.coerce.number().int().positive("limit must be a positive integer").optional(),
});

export type AddExerciseBody = z.infer<typeof addExerciseBodySchema>;
export type GetLogsQuery = z.infer<typeof getLogsQuerySchema>;
