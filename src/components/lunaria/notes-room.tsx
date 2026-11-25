import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { ElementType } from "react";
import { Button } from "@/components/ui/button";
import { Empty, PanelTitle, fieldCls } from "./bits";

export type NoteLike = { id: string; title: string; body: string; created_at: string; extra?: string };

export function NotesRoom({ icon, formTitle, listTitle, items, extraLabel, extraOptions, onSave, onDelete, bodyPlaceholder }: {
  icon: ElementType; formTitle: string; listTitle: string; items: NoteLike[]; extraLabel: string; extraOptions?: string[];
  onSave: (v: { id?: string; title: string; body: string; extra: string }) => void; onDelete: (id: string) => void; bodyPlaceholder: string;
}) {
  const [id, setId] = useState<string | undefined>(); const [title, setTitle] = useState(""); const [body, setBody] = useState(""); const [extra, setExtra] = useState(""); const [q, setQ] = useState("");
  const reset = () => { setId(undefined); setTitle(""); setBody(""); setExtra(""); };
  const shown = items.filter((i) => `${i.title} ${i.body} ${i.extra ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <section className="panel h-fit p-5 lg:sticky lg:top-20">
        <PanelTitle icon={icon} title={id ? "Editing…" : formTitle} />
        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (!body.trim()) return; onSave({ ...(id ? { id } : {}), title: title.trim() || "A little entry", body, extra }); reset(); }}>
          <input className={fieldCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" maxLength={240} />
          <textarea className={fieldCls} rows={8} value={body} onChange={(e) => setBody(e.target.value)} placeholder={bodyPlaceholder} />
          {extraOptions ? (
            <div className="flex flex-wrap gap-1.5">{extraOptions.map((o) => <button type="button" key={o} onClick={() => setExtra(extra === o ? "" : o)} className={`rounded-full px-2.5 py-1 text-sm ${extra === o ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{o}</button>)}</div>
          ) : <input className={fieldCls} value={extra} onChange={(e) => setExtra(e.target.value)} placeholder={extraLabel} />}
          <div className="flex gap-2"><Button className="rounded-full"><Plus /> {id ? "Save changes" : "Save"}</Button>{id && <Button type="button" variant="ghost" onClick={reset}>Cancel</Button>}</div>
        </form>
      </section>
      <section className="panel p-5">
        <div className="mb-3 flex items-center gap-2"><h3 className="mr-auto text-lg">{listTitle}</h3><input className={`${fieldCls} max-w-48`} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {shown.length === 0 ? <Empty title="A fresh page" text="What you write will bloom here." /> : (
          <div className="grid gap-3 sm:grid-cols-2">{shown.map((n) => (
            <article key={n.id} className="rounded-2xl border bg-background/60 p-4">
              <div className="mb-1 flex items-start gap-1"><b className="flex-1">{n.title}</b>
                <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => { setId(n.id); setTitle(n.title); setBody(n.body); setExtra(n.extra ?? ""); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil /></Button>
                <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => { if (confirm("Delete this page?")) onDelete(n.id); }}><Trash2 /></Button></div>
              <p className="line-clamp-6 whitespace-pre-wrap text-sm text-muted-foreground">{n.body}</p>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{n.extra}</span><span>{new Date(n.created_at).toLocaleDateString()}</span></div>
            </article>))}</div>)}
      </section>
    </div>
  );
}
