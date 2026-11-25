import { describe, expect, it } from "vitest";
import { streak } from "./garden";
describe("garden streak", () => {
  it("counts consecutive days ending today", () => expect(streak(["2026-11-23", "2026-11-24", "2026-11-25"], "2026-11-25")).toBe(3));
  it("keeps yesterday's streak alive before today is watered", () => expect(streak(["2026-11-23", "2026-11-24"], "2026-11-25")).toBe(2));
  it("breaks on a missed day", () => expect(streak(["2026-11-22", "2026-11-25"], "2026-11-25")).toBe(1));
});
