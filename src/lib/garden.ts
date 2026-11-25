export function streak(days: string[], today: string): number {
  const set = new Set(days); let n = 0; const d = new Date(today + "T00:00:00Z");
  if (!set.has(today)) d.setUTCDate(d.getUTCDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) { n++; d.setUTCDate(d.getUTCDate() - 1); }
  return n;
}
export function bloom(streakDays: number, seed: string) { return streakDays >= 7 ? "🌺" : streakDays >= 3 ? seed : "🌱"; }
