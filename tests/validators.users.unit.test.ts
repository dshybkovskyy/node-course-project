import { describe, expect, it } from "vitest";
import { createUserBodySchema } from "../src/validators/users.ts";

describe("User validators", () => {
  it("accepts a valid username", () => {
    const parsed = createUserBodySchema.safeParse({ username: "alice" });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.username).toBe("alice");
    }
  });

  it("trims username", () => {
    const parsed = createUserBodySchema.safeParse({ username: "  kate  " });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.username).toBe("kate");
    }
  });

  it("rejects empty username", () => {
    const parsed = createUserBodySchema.safeParse({ username: "   " });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("Username is required");
    }
  });

  it("rejects username longer than 50 characters", () => {
    const parsed = createUserBodySchema.safeParse({
      username: "u".repeat(51),
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe(
        "Username must be at most 50 characters",
      );
    }
  });
});
