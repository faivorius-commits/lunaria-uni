import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowUpRight, BookHeart, CalendarDays, Check, FileImage, FileText, Flower2, Folder, Gamepad2, Music2, Sprout, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PanelTitle } from "@/components/lunaria/bits";
import { useUpload } from "@/components/lunaria/upload";
import { useMutate, useRows, todayISO } from "@/lib/data";
import { useProfile } from "@/lib/profile";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/home")({ head: pageHead("Home", "Your day, softly organized."), component: Home });

function Home() {
  const profile = useProfile(); const upload = useUpload();
  const tasks = useRows("lunaria_tasks"); const tm = useMutate("lunaria_tasks");
  const events = useRows("calendar_events", "event_date", true);
  const diary = useRows("diary_entries"); const files = useRows("user_files");
  const habits = useRows("garden_habits"); const checks = useRows("habit_checkins", "day");
  const today = todayISO();
  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  const open = (tasks.data ?? []).filter((t) => t.status !== "failed" && (!t.done || t.due_date === today)).slice(0, 5);
  const done = (tasks.data ?? []).filter((t) => t.done).length;
  const upcoming = (events.data ?? []).filter((e) => e.event_date >= today).slice(0, 3);
  const doneToday = useMemo(() => new Set((checks.data ?? []).filter((c) => c.day === today).map((c) => c.habit_id)), [checks.data, today]);
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (<>
    <section className="world-welcome universe-cover mb-7">
      <div className="room-kicker">Welcome to Lunaria</div>
      <h1>{greeting},<br />{profile.data?.display_name ?? "dreamer"}<span className="text-gold"> ✧</span></h1>
      <p className="mt-3 text-sm">{dateLabel} · Your little world is waiting.</p>
      <Button className="mt-6 rounded-full" onClick={() => upload()}>✧ Add a little moment</Button>
    </section>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><h2 className="text-3xl">Around your universe</h2><span className="text-sm text-muted-foreground">Little things, lovingly kept.</span></div>
    <div className="dashboard-grid">
      <article className="panel p-5">
        <PanelTitle icon={CalendarDays} title="Today's little plan" right={<Link to="/workspace" className="text-xs text-primary">Planner ↗</Link>} />
        <p className="mb-2 text-xs text-muted-foreground">{done} of {(tasks.data ?? []).length} done</p>
        {open.length === 0 ? <p className="text-sm text-muted-foreground">Nothing planned yet. <Link to="/workspace" className="text-primary">Plan your day</Link></p> :
          open.map((t) => (
            <button key={t.id} onClick={() => tm.update.mutate({ id: t.id, done: !t.done })} className="flex w-full items-center gap-2 rounded-xl px-1 py-1.5 text-left text-sm hover:bg-accent/50">
              <span className={`grid size-5 place-items-center rounded-full border ${t.done ? "bg-primary text-primary-foreground" : ""}`}>{t.done && <Check className="size-3" />}</span>
              <span className={t.done ? "line-through opacity-60" : ""}>{t.title}</span>
            </button>))}
        <p className="mt-3 text-xs text-muted-foreground">Tiny steps count, too. ♡</p>
      </article>
      <article className="panel p-5">
        <PanelTitle icon={Sun} title="Coming up" tone="bg-butter" right={<Link to="/calendar" className="text-xs text-primary">Calendar ↗</Link>} />
        {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">Your calendar is open and dreamy.</p> : upcoming.map((e) => (
          <div key={e.id} className="mb-2 flex items-center gap-3 text-sm"><span className="rounded-xl bg-accent px-2 py-1 text-xs font-semibold">{new Date(e.event_date + "T00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>{e.title}</div>))}
        <Link to="/weather" className="mt-3 flex items-center gap-1 text-sm text-primary">Check world weather <ArrowUpRight className="size-3.5" /></Link>
      </article>
      <article className="panel p-5">
        <PanelTitle icon={Gamepad2} title="Arcade corner" tone="bg-lilac" />
        <div className="flex items-center gap-3 rounded-2xl bg-accent/50 p-3"><div className="text-3xl floaty">✿</div><div><b>Memory Garden</b><p className="text-xs text-muted-foreground">Best: {profile.data?.prefs.arcadeBest ? `${profile.data.prefs.arcadeBest} moves` : "not played yet"}</p></div></div>
        <Link to="/arcade" className="mt-3 flex items-center gap-1 text-sm text-primary">Visit the arcade <ArrowUpRight className="size-3.5" /></Link>
      </article>
      <article className="panel p-5">
        <PanelTitle icon={Folder} title="Your little library" tone="bg-mint" />
        <div className="grid grid-cols-2 gap-2 text-sm">
          <button onClick={() => upload({ category: "Memories" })} className="flex items-center gap-2 rounded-2xl bg-secondary p-3"><FileImage className="size-4" /> Photos</button>
          <button onClick={() => upload({ category: "Music" })} className="flex items-center gap-2 rounded-2xl bg-secondary p-3"><Music2 className="size-4" /> Music</button>
          <button onClick={() => upload({ category: "Documents" })} className="flex items-center gap-2 rounded-2xl bg-secondary p-3"><FileText className="size-4" /> Files</button>
          <Link to="/knowledge" className="flex items-center gap-2 rounded-2xl bg-secondary p-3"><Sprout className="size-4" /> Notes</Link>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{(files.data ?? []).length} treasures saved so far.</p>
      </article>
      <article className="panel p-5">
        <PanelTitle icon={BookHeart} title="Latest diary page" />
        {diary.data?.[0] ? <><b>{diary.data[0].title}</b><p className="line-clamp-3 text-sm text-muted-foreground">{diary.data[0].body}</p></> : <p className="text-sm text-muted-foreground">A fresh page is waiting.</p>}
        <Link to="/diary" className="mt-3 flex items-center gap-1 text-sm text-primary">Open my diary <ArrowUpRight className="size-3.5" /></Link>
      </article>
      <article className="panel p-5">
        <PanelTitle icon={Flower2} title="My garden today" tone="bg-mint" />
        {(habits.data ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Plant your first little habit.</p> :
          <div className="flex flex-wrap gap-2">{(habits.data ?? []).map((hb) => <span key={hb.id} className={`rounded-full px-3 py-1 text-sm ${doneToday.has(hb.id) ? "bg-mint" : "bg-muted text-muted-foreground"}`}>{hb.emoji} {hb.name}</span>)}</div>}
        <Link to="/garden" className="mt-3 flex items-center gap-1 text-sm text-primary">Tend my garden <ArrowUpRight className="size-3.5" /></Link>
      </article>
    </div>
  </>);
}
