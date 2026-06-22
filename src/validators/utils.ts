import type { z } from "zod";

export function getValidationErrorMessage(
  issues: z.core.$ZodIssue[],
  fallback = "Validation error",
): string {
  return issues[0]?.message ?? fallback;
}
