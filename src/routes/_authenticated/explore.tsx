import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, ExternalLink, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/lunaria/app-shell";
import { Empty, PanelTitle, fieldCls } from "@/components/lunaria/bits";
import { useMutate, useRows } from "@/lib/data";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/explore")({ head: pageHead("Explore", "Collect interesting corners of the internet."), component: Explore });
const IDEAS = [
  { title: "NASA Astronomy Picture of the Day", url: "https://apod.nasa.gov/apod/astropix.html" },
  { title: "Radio Garden — live radio worldwide", url: "https://radio.garden" },
  { title: "Wikipedia: random article", url: "https://en.wikipedia.org/wiki/Special:Random" },
  { title: "Google Arts & Culture", url: "https://artsandculture.google.com" },
  { title: "Window Swap — views from other windows", url: "https://www.window-swap.com" },
  { title: "Poetry Foundation poem of the day", url: "https://www.poetryfoundation.org/poems/poem-of-the-day" },
];

function Explore() {
  const links = useRows("explore_links"); const m = useMutate("explore_links");
  const [title, setTitle] = useState(""); const [url, setUrl] = useState(""); const [note, setNote] = useState("");
  const add = (t: string, u: string, n = "") => m.insert.mutate({ title: t, url: u, note: n });
  return (<>
    <Hero title="Explore" blurb="Collect interesting corners of the internet." />
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <section className="panel p-5">
        <PanelTitle icon={Compass} title="My saved corners" tone="bg-sky" />
        <form className="mb-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]" onSubmit={(e) => { e.preventDefault(); const u = /^https?:\/\//i.test(url) ? url : `https://${url}`; if (!title.trim() || !url.trim()) return; add(title.trim(), u, note); setTitle(""); setUrl(""); setNote(""); }}>
          <input className={fieldCls} placeholder="Name" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className={fieldCls} placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
          <Button className="rounded-full"><Plus /> Save</Button>
          <input className={`${fieldCls} sm:col-span-3`} placeholder="Why I love it (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        </form>
        {(links.data ?? []).length === 0 ? <Empty title="No corners saved yet" text="Save a link above or pick a little discovery." /> :
          <ul className="space-y-2">{(links.data ?? []).map((l) => (
            <li key={l.id} className="flex items-start gap-2 rounded-2xl bg-background/60 p-3">
              <a href={l.url} target="_blank" rel="noreferrer" className="flex-1"><b className="flex items-center gap-1">{l.title} <ExternalLink className="size-3" /></b><span className="block truncate text-xs text-muted-foreground">{l.url}</span>{l.note && <p className="text-sm">{l.note}</p>}</a>
              <Button variant="ghost" size="icon" aria-label="Delete link" onClick={() => m.remove.mutate(l.id)}><Trash2 /></Button>
            </li>))}</ul>}
      </section>
      <section className="panel p-5">
        <h3 className="mb-3 text-lg">Little discoveries ✦</h3>
        {IDEAS.map((i) => (
          <div key={i.url} className="mb-2 flex items-center gap-2 text-sm">
            <a href={i.url} target="_blank" rel="noreferrer" className="flex-1 hover:text-primary">{i.title}</a>
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => add(i.title, i.url)}>Save</Button>
          </div>))}
      </section>
    </div>
  </>);
}
