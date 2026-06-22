import { z } from "zod";

const MAX_USERNAME_LENGTH = 50;

export const createUserBodySchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .max(
      MAX_USERNAME_LENGTH,
      `Username must be at most ${MAX_USERNAME_LENGTH} characters`,
    ),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
