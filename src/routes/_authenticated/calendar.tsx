import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/lunaria/app-shell";
import { fieldCls } from "@/components/lunaria/bits";
import { useMutate, useRows, todayISO } from "@/lib/data";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/calendar")({ head: pageHead("Calendar", "Every lovely day, mapped out softly."), component: Cal });

function Cal() {
  const events = useRows("calendar_events", "event_date", true); const m = useMutate("calendar_events");
  const tasks = useRows("lunaria_tasks");
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [sel, setSel] = useState(todayISO());
  const [title, setTitle] = useState(""); const [time, setTime] = useState(""); const [note, setNote] = useState("");
  const days = useMemo(() => {
    const first = (cursor.getDay() + 6) % 7; const n = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({ length: n }, (_, i) => todayISO(new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)))];
  }, [cursor]);
  const byDay = (d: string) => (events.data ?? []).filter((e) => e.event_date === d);
  const tasksDue = (d: string) => (tasks.data ?? []).filter((t) => t.due_date === d);
  const today = todayISO();
  return (<>
    <Hero title="Calendar" blurb="Every lovely day, mapped out softly." />
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <section className="panel p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="mr-auto text-xl">{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2>
          <Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}><ChevronLeft /></Button>
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); setSel(today); }}>Today</Button>
          <Button variant="ghost" size="icon" aria-label="Next month" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}><ChevronRight /></Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => <div key={d}>{d}</div>)}</div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {days.map((d, i) => d ? (
            <button key={d} onClick={() => setSel(d)} className={`flex aspect-square flex-col items-center justify-start rounded-xl p-1 text-sm transition sm:aspect-[4/3] ${sel === d ? "bg-primary text-primary-foreground" : d === today ? "bg-accent" : "hover:bg-accent/60"}`}>
              <span>{Number(d.slice(8))}</span>
              <span className="mt-auto flex gap-0.5">{byDay(d).slice(0, 3).map((e) => <span key={e.id} className="size-1.5 rounded-full bg-current" />)}{tasksDue(d).length > 0 && <span className="text-[9px]">✓</span>}</span>
            </button>) : <div key={`b${i}`} />)}
        </div>
      </section>
      <section className="panel p-5">
        <h3 className="mb-3 text-lg">{new Date(sel + "T00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h3>
        <form className="mb-4 space-y-2" onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; m.insert.mutate({ title: title.trim(), event_date: sel, start_time: time || null, note }, { onSuccess: () => { setTitle(""); setTime(""); setNote(""); } }); }}>
          <input className={fieldCls} placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={240} />
          <div className="flex gap-2"><input className={fieldCls} type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Time" /><Button className="rounded-full"><Plus /> Add</Button></div>
          <input className={fieldCls} placeholder="Little note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        </form>
        {byDay(sel).length === 0 && tasksDue(sel).length === 0 && <p className="text-sm text-muted-foreground">Nothing here yet — a free, dreamy day.</p>}
        {byDay(sel).map((e) => (
          <div key={e.id} className="mb-2 flex items-start gap-2 rounded-2xl bg-accent/50 p-3 text-sm">
            <div className="flex-1"><b>{e.start_time?.slice(0, 5)} {e.title}</b>{e.note && <p className="text-muted-foreground">{e.note}</p>}</div>
            <Button variant="ghost" size="icon" aria-label="Delete event" onClick={() => m.remove.mutate(e.id)}><Trash2 /></Button>
          </div>))}
        {tasksDue(sel).map((t) => <div key={t.id} className="mb-2 rounded-2xl bg-secondary p-3 text-sm">{t.done ? "✓" : "○"} Task: {t.title}</div>)}
      </section>
    </div>
  </>);
}
