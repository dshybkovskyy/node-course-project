import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { errorHandler } from "../src/middleware/errorHandler.ts";

describe("errorHandler middleware", () => {
  it("returns 500 JSON response", () => {
    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const res = { status, json } as unknown as Response;

    const req = {} as Request;
    const next = vi.fn() as unknown as NextFunction;

    errorHandler(new Error("boom"), req, res, next);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});
