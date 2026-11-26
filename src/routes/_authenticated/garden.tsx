import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Flower2, Plus, Trash2, Pencil, Check, Sprout } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Hero } from "@/components/lunaria/app-shell";
import { Empty, fieldCls } from "@/components/lunaria/bits";
import { useMutate, useRows, todayISO } from "@/lib/data";
import { pageHead } from "@/lib/head";
import { streak, bloom } from "@/lib/garden";
import { frequencyLabel, habitProgress, WEEKDAYS, type Frequency } from "@/lib/habit-schedule";
import type { Tables } from "@/integrations/supabase/types";
export const Route = createFileRoute("/_authenticated/garden")({
  head: pageHead("My Garden", "A living garden of daily, weekly and monthly rituals."),
  component: Garden,
});
const SEEDS = ["🌱", "🌷", "🌻", "🌼", "🪴", "🍀", "🌸", "🌵"];
function Garden() {
  const habits = useRows("garden_habits", "created_at", true);
  const hm = useMutate("garden_habits");
  const checks = useRows("habit_checkins", "day");
  const cm = useMutate("habit_checkins");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🌷");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [mode, setMode] = useState("target");
  const [target, setTarget] = useState(1);
  const [days, setDays] = useState<number[]>([]);
  const [error, setError] = useState("");
  const today = todayISO();
  function show(h?: Tables<"garden_habits">) {
    setEditing(h?.id ?? null);
    setName(h?.name ?? "");
    setEmoji(h?.emoji ?? "🌷");
    setFrequency((h?.frequency ?? "daily") as Frequency);
    setMode(h?.frequency_mode ?? "target");
    setTarget(h?.frequency_target ?? 1);
    setDays(h?.target_days ?? []);
    setError("");
    setOpen(true);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || (frequency !== "daily" && mode === "days" && !days.length)) {
      setError("Give your habit a name and select at least one scheduled day.");
      return;
    }
    const values = {
      name: name.trim(),
      emoji,
      frequency,
      frequency_mode: frequency === "daily" ? "target" : mode,
      frequency_target: frequency === "daily" ? 1 : target,
      target_days: mode === "days" && frequency !== "daily" ? days : [],
    };
    try {
      if (editing) await hm.update.mutateAsync({ id: editing, ...values });
      else await hm.insert.mutateAsync(values);
      setOpen(false);
      toast.success(editing ? "Habit updated" : "A new habit planted");
    } catch {
      setError("Your habit could not be saved. Please try again.");
    }
  }
  return (
    <>
      <Hero
        title="My Garden"
        blurb="A little care. A little growth. Your own rhythm."
        action={
          <Button onClick={() => show()}>
            <Plus />
            Plant a habit
          </Button>
        }
      />
      <div className="mb-6 flex flex-wrap items-center gap-4 border-b pb-4 text-sm">
        <Flower2 className="text-primary" />
        <span>{habits.data?.length ?? 0} growing rituals</span>
        <span className="text-muted-foreground">
          {
            (habits.data ?? []).filter(
              (h) =>
                habitProgress(
                  h,
                  (checks.data ?? []).filter((c) => c.habit_id === h.id).map((c) => c.day),
                  today,
                ).complete,
            ).length
          }{" "}
          goals reached this period
        </span>
      </div>
      {habits.isError || checks.isError ? (
        <p role="alert" className="text-destructive">
          Your garden could not load.{" "}
          <Button
            variant="outline"
            onClick={() => {
              void habits.refetch();
              void checks.refetch();
            }}
          >
            Try again
          </Button>
        </p>
      ) : habits.isLoading ? (
        <p>Gathering your garden…</p>
      ) : !habits.data?.length ? (
        <Empty
          title="Every garden begins with a seed"
          text="A ritual worth keeping, at your own pace."
          action={
            <Button onClick={() => show()}>
              <Sprout />
              Plant your first habit
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {habits.data.map((h, i) => {
            const rows = (checks.data ?? []).filter((c) => c.habit_id === h.id);
            const completed = rows.map((c) => c.day);
            const p = habitProgress(h, completed, today);
            const todayRows = rows.filter((c) => c.day === today);
            return (
              <article
                key={h.id}
                className={`habit-object ${["garden-mint", "garden-pink", "garden-sky"][i % 3]}`}
              >
                <div className="flex items-start justify-between">
                  <span className="habit-flower floaty" aria-hidden>
                    {h.frequency === "daily" ? bloom(streak(completed, today), h.emoji) : h.emoji}
                  </span>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${h.name}`}
                      onClick={() => show(h)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${h.name}`}
                      onClick={() => {
                        if (confirm(`Remove “${h.name}” and its check-ins?`))
                          hm.remove.mutate(h.id);
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
                <h2 className="mt-3 break-words text-2xl">{h.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{frequencyLabel(h)}</p>
                <div className="mt-5 flex justify-between text-sm">
                  <span>
                    {p.count} / {p.target} completed
                  </span>
                  <span>
                    {h.frequency === "daily"
                      ? "Today"
                      : h.frequency === "weekly"
                        ? "This week"
                        : "This month"}
                  </span>
                </div>
                <Progress value={p.percent} className="mt-2 h-2" />
                <div className="my-4 flex flex-wrap gap-1.5" aria-label="Period completion history">
                  {p.days.map((day) => (
                    <span
                      key={day}
                      title={`${day}${completed.includes(day) ? " · complete" : ""}`}
                      className={`grid size-6 place-items-center rounded-full text-[10px] ${completed.includes(day) ? "bg-primary text-primary-foreground" : p.scheduled.includes(day) ? "bg-card" : "text-muted-foreground"}`}
                    >
                      {completed.includes(day) ? (
                        <Check className="size-3" />
                      ) : (
                        Number(day.slice(-2))
                      )}
                    </span>
                  ))}
                </div>
                <p className="mb-3 min-h-5 text-xs text-muted-foreground">
                  {h.frequency === "daily"
                    ? `${streak(completed, today)}-day streak`
                    : p.complete
                      ? "Your goal is reached. Lovely work."
                      : !p.dueToday
                        ? "No scheduled completion today."
                        : `${p.target - p.count} more to reach your ${h.frequency === "weekly" ? "weekly" : "monthly"} goal`}
                </p>
                <Button
                  className="w-full"
                  disabled={
                    cm.insert.isPending ||
                    cm.remove.isPending ||
                    checks.isLoading ||
                    (!todayRows.length && !p.dueToday)
                  }
                  variant={todayRows.length ? "outline" : "default"}
                  onClick={async () => {
                    try {
                      if (todayRows.length)
                        await Promise.all(todayRows.map((c) => cm.remove.mutateAsync(c.id)));
                      else {
                        await cm.insert.mutateAsync({ habit_id: h.id, day: today });
                        toast.success("A little growth, beautifully done ✧");
                      }
                    } catch {
                      /* mutation displays error */
                    }
                  }}
                >
                  {todayRows.length ? (
                    <>
                      <Check />
                      Completed today
                    </>
                  ) : (
                    <>
                      <Sprout />
                      {p.dueToday ? "Complete today" : "Rest day"}
                    </>
                  )}
                </Button>
              </article>
            );
          })}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Tend your habit" : "Plant a new habit"}</DialogTitle>
            <DialogDescription>A rhythm that belongs to you.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <label className="block text-sm">
              Habit name
              <input
                aria-label="Habit name"
                className={`${fieldCls} mt-1`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                required
              />
            </label>
            <div className="flex flex-wrap gap-1">
              {SEEDS.map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant={emoji === s ? "secondary" : "ghost"}
                  size="icon"
                  aria-label={`Seed ${s}`}
                  aria-pressed={emoji === s}
                  onClick={() => setEmoji(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
            <label className="block text-sm">
              Habit frequency
              <select
                aria-label="Habit frequency"
                className={`${fieldCls} mt-1`}
                value={frequency}
                onChange={(e) => {
                  setFrequency(e.target.value as Frequency);
                  setTarget(1);
                  setDays([]);
                  setMode("target");
                }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
            {frequency !== "daily" && (
              <>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={mode === "target" ? "default" : "outline"}
                    onClick={() => setMode("target")}
                  >
                    Completion target
                  </Button>
                  <Button
                    type="button"
                    variant={mode === "days" ? "default" : "outline"}
                    onClick={() => setMode("days")}
                  >
                    {frequency === "weekly" ? "Select days" : "Select dates"}
                  </Button>
                </div>
                {mode === "target" ? (
                  <label className="block text-sm">
                    Times per {frequency === "weekly" ? "week" : "month"}
                    <input
                      aria-label="Completion target"
                      type="number"
                      className={`${fieldCls} mt-1`}
                      min={1}
                      max={frequency === "weekly" ? 7 : 31}
                      value={target}
                      required
                      onChange={(e) => setTarget(Number(e.target.value))}
                    />
                  </label>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: frequency === "weekly" ? 7 : 31 }, (_, i) =>
                      frequency === "weekly" ? i : i + 1,
                    ).map((d) => (
                      <Button
                        key={d}
                        size="sm"
                        type="button"
                        aria-pressed={days.includes(d)}
                        variant={days.includes(d) ? "default" : "outline"}
                        onClick={() =>
                          setDays((prev) =>
                            prev.includes(d) ? prev.filter((n) => n !== d) : [...prev, d],
                          )
                        }
                      >
                        {frequency === "weekly" ? WEEKDAYS[d] : d}
                      </Button>
                    ))}
                    {frequency === "monthly" && (
                      <p className="text-xs text-muted-foreground">
                        Dates beyond a month’s length fall on its last day.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <Button className="w-full" disabled={hm.insert.isPending || hm.update.isPending}>
              <Flower2 />
              {hm.insert.isPending || hm.update.isPending
                ? "Saving…"
                : editing
                  ? "Save habit"
                  : "Plant habit"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
