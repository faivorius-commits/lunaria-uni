export type Frequency = "daily" | "weekly" | "monthly";
export type Schedule = {
  frequency: string;
  frequency_mode: string;
  frequency_target: number;
  target_days: number[];
};
export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const iso = (d: Date) => d.toISOString().slice(0, 10);
export function habitPeriod(schedule: Schedule, today: string) {
  const date = new Date(`${today}T00:00:00Z`);
  const start = new Date(date);
  const end = new Date(date);
  if (schedule.frequency === "weekly") {
    start.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
    end.setTime(start.getTime());
    end.setUTCDate(start.getUTCDate() + 6);
  }
  if (schedule.frequency === "monthly") {
    start.setUTCDate(1);
    end.setUTCMonth(end.getUTCMonth() + 1, 0);
  }
  const days: string[] = [];
  for (const d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) days.push(iso(d));
  const last = end.getUTCDate();
  const selected = new Set(
    schedule.target_days.map((n) => (schedule.frequency === "monthly" ? Math.min(n, last) : n)),
  );
  const scheduled =
    schedule.frequency_mode === "days"
      ? days.filter((day) => {
          const d = new Date(`${day}T00:00:00Z`);
          return selected.has(schedule.frequency === "weekly" ? d.getUTCDay() : d.getUTCDate());
        })
      : days;
  return {
    start: iso(start),
    end: iso(end),
    days,
    scheduled,
    target:
      schedule.frequency_mode === "days"
        ? scheduled.length
        : Math.min(schedule.frequency_target, days.length),
  };
}
export function habitProgress(schedule: Schedule, completions: string[], today: string) {
  const period = habitPeriod(schedule, today);
  const completed = [...new Set(completions)].filter((day) => period.scheduled.includes(day));
  return {
    ...period,
    count: completed.length,
    percent: Math.min(100, Math.round((completed.length / Math.max(1, period.target)) * 100)),
    dueToday: period.scheduled.includes(today),
    complete: completed.length >= period.target,
  };
}
export function frequencyLabel(s: Schedule) {
  if (s.frequency === "daily") return "Every day";
  if (s.frequency_mode === "days")
    return s.frequency === "weekly"
      ? [...s.target_days]
          .sort((a, b) => a - b)
          .map((d) => WEEKDAYS[d])
          .join(" · ")
      : `Monthly · dates ${[...s.target_days].sort((a, b) => a - b).join(", ")}`;
  return `${s.frequency_target} ${s.frequency_target === 1 ? "time" : "times"} per ${s.frequency === "weekly" ? "week" : "month"}`;
}
