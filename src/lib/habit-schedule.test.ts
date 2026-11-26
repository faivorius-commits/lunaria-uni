import { describe, expect, it } from "vitest";
import { habitProgress, type Schedule } from "./habit-schedule";
const daily: Schedule = {
  frequency: "daily",
  frequency_mode: "target",
  frequency_target: 1,
  target_days: [],
};
describe("habit schedules", () => {
  it("reading daily requires one completion today", () => {
    expect(habitProgress(daily, ["2026-11-25"], "2026-11-26").count).toBe(0);
    expect(habitProgress(daily, ["2026-11-26"], "2026-11-26").complete).toBe(true);
  });
  it("exercise three times weekly counts Monday through Sunday, not daily failure", () => {
    const p = habitProgress(
      { ...daily, frequency: "weekly", frequency_target: 3 },
      ["2026-11-22", "2026-11-23", "2026-11-25", "2026-11-25", "2026-11-27"],
      "2026-11-27",
    );
    expect(p.count).toBe(3);
    expect(p.start).toBe("2026-11-23");
    expect(p.end).toBe("2026-11-29");
    expect(p.complete).toBe(true);
  });
  it("room cleaning once per week remains complete on an uncompleted day", () =>
    expect(
      habitProgress({ ...daily, frequency: "weekly" }, ["2026-11-23"], "2026-11-26").complete,
    ).toBe(true));
  it("monthly finances once per month ignores past month and stays complete", () => {
    const p = habitProgress(
      { ...daily, frequency: "monthly" },
      ["2026-10-31", "2026-11-01"],
      "2026-11-26",
    );
    expect(p.count).toBe(1);
    expect(p.complete).toBe(true);
  });
  it("weekly selected days count only chosen weekdays", () => {
    const p = habitProgress(
      { ...daily, frequency: "weekly", frequency_mode: "days", target_days: [1, 3, 5] },
      ["2026-11-23", "2026-11-24", "2026-11-25"],
      "2026-11-26",
    );
    expect(p.count).toBe(2);
    expect(p.target).toBe(3);
    expect(p.dueToday).toBe(false);
  });
  it("monthly selected dates clamp to last day without duplicating February", () => {
    const p = habitProgress(
      { ...daily, frequency: "monthly", frequency_mode: "days", target_days: [15, 30, 31] },
      ["2024-02-15", "2024-02-29"],
      "2024-02-29",
    );
    expect(p.target).toBe(2);
    expect(p.count).toBe(2);
    expect(p.end).toBe("2024-02-29");
  });
  it("weekly period crosses year boundary correctly", () =>
    expect(habitProgress({ ...daily, frequency: "weekly" }, [], "2027-01-01").start).toBe(
      "2026-12-28",
    ));
});
