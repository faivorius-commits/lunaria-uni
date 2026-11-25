import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/lunaria/app-shell";
import { Empty, PanelTitle, fieldCls } from "@/components/lunaria/bits";
import { FileGallery } from "@/components/lunaria/file-gallery";
import { useMutate, useRows } from "@/lib/data";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/workspace")({ head: pageHead("Workspace", "Your projects, plans, and ideas live here."), component: Workspace });

function Workspace() {
  const tasks = useRows("lunaria_tasks"); const m = useMutate("lunaria_tasks");
  const [title, setTitle] = useState(""); const [due, setDue] = useState(""); const [show, setShow] = useState<"open" | "done" | "all">("open");
  const list = (tasks.data ?? []).filter((t) => show === "all" || (show === "done" ? t.done : !t.done));
  return (<>
    <Hero title="Workspace" blurb="Your projects, plans, and ideas live here." />
    <section className="panel mb-6 p-5">
      <PanelTitle icon={LayoutDashboard} title="Little plans" />
      <form className="mb-4 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; m.insert.mutate({ title: title.trim(), due_date: due || null }, { onSuccess: () => { setTitle(""); setDue(""); } }); }}>
        <input className={fieldCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a little task…" maxLength={240} />
        <input className={`${fieldCls} sm:w-44`} type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
        <Button className="rounded-full" disabled={m.insert.isPending}><Plus /> Add</Button>
      </form>
      <div className="mb-3 flex gap-1">{(["open", "done", "all"] as const).map((s) => <button key={s} onClick={() => setShow(s)} className={`rounded-full px-3 py-1 text-sm capitalize ${show === s ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{s}</button>)}</div>
      {list.length === 0 ? <Empty title="All clear" text="Add a task above to start shaping your day." /> : (
        <ul className="divide-y">{list.map((t) => (
          <li key={t.id} className="flex items-center gap-3 py-2">
            <button aria-label={t.done ? "Mark not done" : "Mark done"} onClick={() => m.update.mutate({ id: t.id, done: !t.done })} className={`grid size-6 shrink-0 place-items-center rounded-full border ${t.done ? "bg-primary text-primary-foreground" : ""}`}>{t.done && <Check className="size-3.5" />}</button>
            <span className={`flex-1 ${t.done ? "line-through opacity-60" : ""}`}>{t.title}</span>
            {t.due_date && <span className="text-xs text-muted-foreground">{t.due_date}</span>}
            <Button variant="ghost" size="icon" aria-label="Delete task" onClick={() => m.remove.mutate(t.id)}><Trash2 /></Button>
          </li>))}</ul>)}
    </section>
    <FileGallery filter={(f) => f.category === "Workspace"} category="Workspace" emptyTitle="No project files yet" />
  </>);
}
