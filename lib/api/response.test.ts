import { describe, it, expect } from "vitest";
import { safeParseBody } from "@/lib/api/response";
import { z } from "zod";

describe("api response helpers", () => {
  it("validates uuid bodies", () => {
    const schema = z.object({ id: z.string().uuid() });
    const bad = safeParseBody({ id: "nope" }, schema);
    expect(bad.ok).toBe(false);
    const good = safeParseBody({ id: "123e4567-e89b-12d3-a456-426614174000" }, schema);
    expect(good.ok).toBe(true);
  });
});
