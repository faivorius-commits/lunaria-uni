import { expect, it } from "vitest";
import { activityDay, activityTime, newestFirst } from "./activity";
it("sorts by actual event time newest first", () =>
  expect(
    newestFirst([{ created_at: "2026-11-27T05:30:00Z" }, { created_at: "2026-11-27T11:30:00Z" }])[0]
      ?.created_at,
  ).toBe("2026-11-27T11:30:00Z"));
it("displays local day and HH:mm without mutating event time", () => {
  const stamp = "2026-11-27T23:30:00Z";
  const d = new Date(stamp);
  expect(activityTime(stamp)).toBe(
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false }),
  );
  expect(activityDay(stamp)).toBe(
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
  );
});
