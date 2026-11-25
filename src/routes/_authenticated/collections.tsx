import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Archive, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/lunaria/app-shell";
import { Empty, PanelTitle, fieldCls } from "@/components/lunaria/bits";
import { FileGallery } from "@/components/lunaria/file-gallery";
import { useMutate, useRows } from "@/lib/data";
import { pageHead } from "@/lib/head";
import { RecipesPanel } from "@/components/lunaria/recipes";

export const Route = createFileRoute("/_authenticated/collections")({ head: pageHead("Collections", "All your favorite things, gathered together."), component: C });
const EMOJI = ["✧", "✿", "☾", "♡", "★", "❀", "♪", "📚", "🎞️", "🧸"];
function C() {
  const cols = useRows("collections"); const m = useMutate("collections"); const files = useRows("user_files");
  const [name, setName] = useState(""); const [desc, setDesc] = useState(""); const [emoji, setEmoji] = useState("✧"); const [sel, setSel] = useState<string | null>(null);
  const current = (cols.data ?? []).find((c) => c.id === sel);
  const count = (id: string) => (files.data ?? []).filter((f) => f.collection_id === id).length;
  return (<>
    <RecipesPanel />
    <Hero title="Collections" blurb="All your favorite things, gathered together." />
    <section className="panel mb-6 p-5">
      <PanelTitle icon={Archive} title="Create a collection" tone="bg-butter" />
      <form className="grid gap-2 sm:grid-cols-[auto_1fr_1fr_auto]" onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; m.insert.mutate({ name: name.trim(), description: desc, emoji }, { onSuccess: () => { setName(""); setDesc(""); } }); }}>
        <select aria-label="Emoji" className={`${fieldCls} sm:w-20`} value={emoji} onChange={(e) => setEmoji(e.target.value)}>{EMOJI.map((x) => <option key={x}>{x}</option>)}</select>
        <input className={fieldCls} placeholder="Collection name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
        <input className={fieldCls} placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <Button className="rounded-full"><Plus /> Create</Button>
      </form>
    </section>
    {(cols.data ?? []).length === 0 ? <section className="panel p-5"><Empty title="No collections yet" text="Create one above, then add files to it while uploading or from any file's preview." /></section> : (
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {(cols.data ?? []).map((c) => (
          <div key={c.id} className={`panel relative p-4 transition ${sel === c.id ? "ring-2 ring-primary" : ""}`}>
            <button className="w-full text-left" onClick={() => setSel(sel === c.id ? null : c.id)}>
              <div className="mb-2 text-3xl">{c.emoji}</div><b>{c.name}</b>
              <p className="line-clamp-2 text-xs text-muted-foreground">{c.description || `${count(c.id)} items`}</p>
            </button>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2" aria-label={`Delete ${c.name}`} onClick={() => { if (confirm(`Delete “${c.name}”? Files stay safe in their rooms.`)) { m.remove.mutate(c.id); if (sel === c.id) setSel(null); } }}><Trash2 /></Button>
          </div>))}
      </div>)}
    {current && <><h2 className="mb-3 text-2xl">{current.emoji} {current.name}</h2>
      <FileGallery key={current.id} filter={(f) => f.collection_id === current.id} category="Memories" collectionId={current.id} emptyTitle="This collection is empty" /></>}
  </>);
}
