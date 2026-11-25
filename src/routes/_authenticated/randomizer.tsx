import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Dice5, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/lunaria/app-shell";
import { PanelTitle, fieldCls } from "@/components/lunaria/bits";
import { useProfile, useSaveProfile } from "@/lib/profile";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/randomizer")({ head: pageHead("Randomizer", "Let a little magic make the choice."), component: Rand });
const DEFAULTS = ["Write three lines in your diary", "Take a little photo walk", "Listen to a new song", "Read for ten minutes", "Learn one new word", "Tidy one tiny corner", "Draw something silly", "Explore a country on the map"];

function Rand() {
  const profile = useProfile(); const save = useSaveProfile();
  const list = profile.data?.prefs.randomList ?? DEFAULTS;
  const [choice, setChoice] = useState(""); const [item, setItem] = useState(""); const [extra, setExtra] = useState("");
  const setList = (l: string[]) => save.mutate({ prefs: { randomList: l } });
  return (<>
    <Hero title="Randomizer" blurb="Let a little magic make the choice." />
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <section className="panel p-6 text-center">
        <div className="mx-auto mb-3 grid size-20 place-items-center rounded-full bg-gradient-to-br from-petal to-lilac text-4xl floaty">✧</div>
        <h2 className="text-2xl">What shall we do next?</h2>
        <p className="text-muted-foreground">Let the little stars pick something for you.</p>
        <div className="my-5 min-h-16 rounded-2xl bg-accent/50 p-5 text-lg">{choice || "Your little surprise will appear here."}</div>
        <Button className="rounded-full" disabled={!list.length} onClick={() => setChoice(list[Math.floor(Math.random() * list.length)] ?? "")}><Sparkles /> Surprise me</Button>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => setExtra(`🎲 You rolled a ${1 + Math.floor(Math.random() * 6)}`)}><Dice5 /> Roll a die</Button>
          <Button variant="outline" className="rounded-full" onClick={() => setExtra(Math.random() < 0.5 ? "☀️ Sun side (heads)" : "☾ Moon side (tails)")}>Flip a coin</Button>
        </div>
        {extra && <p className="mt-3 text-lg">{extra}</p>}
      </section>
      <section className="panel p-5">
        <PanelTitle icon={Sparkles} title="My wish list" tone="bg-lilac" />
        <form className="mb-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (item.trim()) { setList([...list, item.trim()]); setItem(""); } }}>
          <input className={fieldCls} value={item} onChange={(e) => setItem(e.target.value)} placeholder="Add an option…" /><Button className="rounded-full">Add</Button>
        </form>
        <ul className="space-y-1">{list.map((l, i) => <li key={`${l}${i}`} className="flex items-center gap-2 rounded-xl bg-background/60 px-3 py-1.5 text-sm"><span className="flex-1">{l}</span><button aria-label={`Remove ${l}`} onClick={() => setList(list.filter((_, j) => j !== i))}><X className="size-4" /></button></li>)}</ul>
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => setList(DEFAULTS)}>Restore defaults</Button>
      </section>
    </div>
  </>);
}
