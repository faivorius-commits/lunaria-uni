import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Droplets, Sun } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/lunaria/app-shell";
import { PanelTitle, fieldCls } from "@/components/lunaria/bits";
import { useRows, todayISO } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/daily")({ head: pageHead("Daily World", "Make room for the little things that matter."), component: Daily });
const MOODS = ["🌸 Lovely", "☀️ Bright", "🌙 Calm", "☁️ Cloudy", "🌧️ Heavy", "⚡ Restless"];

function Daily() {
  const logs = useRows("daily_logs", "day"); const qc = useQueryClient();
  const today = todayISO(); const existing = (logs.data ?? []).find((l) => l.day === today);
  const [mood, setMood] = useState(""); const [intention, setIntention] = useState(""); const [gratitude, setGratitude] = useState(""); const [water, setWater] = useState(0);
  useEffect(() => { if (existing) { setMood(existing.mood); setIntention(existing.intention); setGratitude(existing.gratitude); setWater(existing.water); } }, [existing?.id]);
  async function save(next?: Partial<{ water: number }>) {
    const { data: u } = await supabase.auth.getUser(); if (!u.user) return;
    const { error } = await supabase.from("daily_logs").upsert({ user_id: u.user.id, day: today, mood, intention, gratitude, water: next?.water ?? water }, { onConflict: "user_id,day" });
    if (error) toast.error(error.message); else { if (!next) toast.success("Today is saved ✧"); void qc.invalidateQueries({ queryKey: ["daily_logs"] }); }
  }
  return (<>
    <Hero title="Daily World" blurb="Make room for the little things that matter." />
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <section className="panel space-y-4 p-5">
        <PanelTitle icon={Sun} title="How is today feeling?" tone="bg-butter" />
        <div className="flex flex-wrap gap-2">{MOODS.map((m) => <button key={m} onClick={() => setMood(m)} className={`rounded-full px-3 py-1.5 text-sm ${mood === m ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{m}</button>)}</div>
        <label className="block text-sm font-medium">Today's intention<input className={`${fieldCls} mt-1`} value={intention} onChange={(e) => setIntention(e.target.value)} placeholder="One gentle focus for today…" /></label>
        <label className="block text-sm font-medium">Something I'm grateful for<textarea className={`${fieldCls} mt-1`} rows={3} value={gratitude} onChange={(e) => setGratitude(e.target.value)} placeholder="A small, lovely thing…" /></label>
        <Button className="rounded-full" onClick={() => void save()}>Save today</Button>
      </section>
      <section className="panel p-5">
        <PanelTitle icon={Droplets} title="Water drops" tone="bg-sky" />
        <div className="mb-3 flex flex-wrap gap-1.5">{Array.from({ length: 8 }, (_, i) => (
          <button key={i} aria-label={`${i + 1} glasses`} onClick={() => { const w = water === i + 1 ? i : i + 1; setWater(w); void save({ water: w }); }} className={`grid size-9 place-items-center rounded-full text-lg ${i < water ? "bg-sky" : "bg-muted opacity-50"}`}>💧</button>))}</div>
        <p className="text-sm text-muted-foreground">{water} of 8 glasses</p>
        <h3 className="mt-6 mb-2 text-base">Recent days</h3>
        {(logs.data ?? []).slice(0, 7).map((l) => <div key={l.id} className="mb-1 flex justify-between text-sm"><span>{l.day}</span><span>{l.mood || "—"}</span></div>)}
      </section>
    </div>
  </>);
}
