import { expect, it } from "vitest";
import { memoryMatches, memoryMonth } from "./memories";
it("a photo uploaded now but dated 15 June 2022 belongs to June 2022", () =>
  expect(memoryMonth({ memory_date: "2022-06-15", memory_category: "Travel" })).toBe("2022-06"));
it("year month and category filters use the memory date", () => {
  const f = { memory_date: "2022-06-15", memory_category: "Travel" };
  expect(memoryMatches(f, "2022", "06", "Travel")).toBe(true);
  expect(memoryMatches(f, "2026", "", "")).toBe(false);
  expect(memoryMatches(f, "", "07", "")).toBe(false);
  expect(memoryMatches(f, "", "", "Family")).toBe(false);
});
it("existing photos without a supplied date stay undated", () =>
  expect(memoryMonth({ memory_date: null, memory_category: "" })).toBe("undated"));
