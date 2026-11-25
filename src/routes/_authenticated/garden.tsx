import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Flower2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/lunaria/app-shell";
import { Empty, PanelTitle, fieldCls } from "@/components/lunaria/bits";
import { useMutate, useRows, todayISO } from "@/lib/data";
import { pageHead } from "@/lib/head";
import { streak, bloom } from "@/lib/garden";

export const Route = createFileRoute("/_authenticated/garden")({ head: pageHead("My Garden", "Small steps help lovely things grow."), component: G });
const SEEDS = ["🌱", "🌷", "🌻", "🌼", "🪴", "🍀", "🌸", "🌵"];
function G() {
  const habits = useRows("garden_habits", "created_at", true); const hm = useMutate("garden_habits");
  const checks = useRows("habit_checkins", "day"); const cm = useMutate("habit_checkins");
  const [name, setName] = useState(""); const [emoji, setEmoji] = useState("🌱");
  const today = todayISO();
  const week = Array.from({ length: 7 }, (_, i) => todayISO(new Date(Date.now() - (6 - i) * 86400000)));
  const daysFor = (id: string) => (checks.data ?? []).filter((c) => c.habit_id === id);
  return (<>
    <Hero title="My Garden" blurb="Small steps help lovely things grow. Check off a habit each day to help it bloom." />
    <section className="panel mb-6 p-5">
      <PanelTitle icon={Flower2} title="Plant a habit" tone="bg-mint" />
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; hm.insert.mutate({ name: name.trim(), emoji }, { onSuccess: () => setName("") }); }}>
        <select aria-label="Seed" className={`${fieldCls} sm:w-20`} value={emoji} onChange={(e) => setEmoji(e.target.value)}>{SEEDS.map((s) => <option key={s}>{s}</option>)}</select>
        <input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Drink water, stretch, read…" maxLength={120} />
        <Button className="rounded-full"><Plus /> Plant</Button>
      </form>
    </section>
    {(habits.data ?? []).length === 0 ? <section className="panel p-5"><Empty title="Your garden is waiting" text="Plant your first habit above." /></section> : (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(habits.data ?? []).map((h) => {
        const ds = daysFor(h.id); const set = new Set(ds.map((d) => d.day)); const s = streak([...set], today); const todayRow = ds.find((d) => d.day === today);
        return (
          <article key={h.id} className="panel p-5">
            <div className="flex items-start gap-2"><div className="text-4xl floaty">{bloom(s, h.emoji)}</div><div className="flex-1"><b>{h.name}</b><p className="text-xs text-muted-foreground">{s}-day streak</p></div>
              <Button variant="ghost" size="icon" aria-label={`Remove ${h.name}`} onClick={() => { if (confirm(`Remove “${h.name}” from your garden?`)) hm.remove.mutate(h.id); }}><Trash2 /></Button></div>
            <div className="my-3 flex justify-between">{week.map((d) => <span key={d} title={d} className={`size-6 rounded-full ${set.has(d) ? "bg-mint" : "bg-muted"}`} />)}</div>
            <Button className="w-full rounded-full" variant={todayRow ? "outline" : "default"} onClick={() => todayRow ? cm.remove.mutate(todayRow.id) : cm.insert.mutate({ habit_id: h.id, day: today })}>{todayRow ? "Watered today ✓" : "Water today"}</Button>
          </article>); })}</div>)}
  </>);
}
