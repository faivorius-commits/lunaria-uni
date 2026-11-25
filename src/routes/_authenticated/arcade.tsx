import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gamepad2, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/lunaria/app-shell";
import { PanelTitle, fieldCls } from "@/components/lunaria/bits";
import { useProfile, useSaveProfile } from "@/lib/profile";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/arcade")({ head: pageHead("Arcade", "A tiny corner for play and little challenges."), component: Arcade });
const SYMBOLS = ["✿", "☾", "★", "♡", "❀", "✦", "☁", "♪"];
const shuffle = () => [...SYMBOLS, ...SYMBOLS].map((s) => ({ s, r: Math.random() })).sort((a, b) => a.r - b.r).map((x) => x.s);

function Arcade() {
  const profile = useProfile(); const save = useSaveProfile();
  const [cards, setCards] = useState<string[]>(shuffle); const [flip, setFlip] = useState<number[]>([]); const [matched, setMatched] = useState<number[]>([]); const [moves, setMoves] = useState(0);
  const won = matched.length === cards.length;
  useEffect(() => {
    if (flip.length !== 2) return;
    const [a, b] = flip as [number, number];
    const t = setTimeout(() => { if (cards[a] === cards[b]) setMatched((m) => [...m, a, b]); setFlip([]); }, 650);
    return () => clearTimeout(t);
  }, [flip, cards]);
  useEffect(() => { if (won && moves > 0) { const best = profile.data?.prefs.arcadeBest; if (!best || moves < best) save.mutate({ prefs: { arcadeBest: moves } }); } }, [won]);
  const reset = () => { setCards(shuffle()); setFlip([]); setMatched([]); setMoves(0); };

  const [target, setTarget] = useState(() => 1 + Math.floor(Math.random() * 50)); const [guess, setGuess] = useState(""); const [hint, setHint] = useState("I'm thinking of a number from 1 to 50…"); const [tries, setTries] = useState(0);
  return (<>
    <Hero title="Arcade" blurb="A tiny corner for play and little challenges." />
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <section className="panel p-5">
        <PanelTitle icon={Gamepad2} title="Memory Garden" tone="bg-lilac" right={<span className="text-sm text-muted-foreground">Moves {moves} · Best {profile.data?.prefs.arcadeBest ?? "—"}</span>} />
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          {cards.map((s, i) => { const up = flip.includes(i) || matched.includes(i); return (
            <button key={i} aria-label={up ? s : "Hidden card"} disabled={up || flip.length === 2} onClick={() => { setFlip([...flip, i]); if (flip.length === 1) setMoves(moves + 1); }}
              className={`grid aspect-square place-items-center rounded-2xl text-3xl transition ${matched.includes(i) ? "bg-mint" : up ? "bg-petal" : "bg-gradient-to-br from-lilac to-primary/60 text-transparent hover:scale-105"}`}>{up ? s : "?"}</button>); })}
        </div>
        <div className="mt-4 text-center">{won && <p className="mb-2 text-lg">You grew the whole garden in {moves} moves ✧</p>}<Button className="rounded-full" onClick={reset}>New round</Button></div>
      </section>
      <section className="panel p-5">
        <PanelTitle icon={Moon} title="Moon Guess" tone="bg-sky" />
        <p className="mb-3 text-sm text-muted-foreground">{hint}</p>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const g = Number(guess); if (!g) return; const n = tries + 1; setTries(n); setGuess("");
          setHint(g === target ? `Yes! ${target} in ${n} tries ☾` : g < target ? `${g} is too low — reach higher ✦` : `${g} is too high — float lower ✧`); }}>
          <input className={fieldCls} type="number" min={1} max={50} value={guess} onChange={(e) => setGuess(e.target.value)} aria-label="Your guess" />
          <Button className="rounded-full">Guess</Button>
        </form>
        <Button variant="outline" className="mt-3 w-full rounded-full" onClick={() => { setTarget(1 + Math.floor(Math.random() * 50)); setTries(0); setHint("A new number is hiding from 1 to 50…"); }}>New number</Button>
      </section>
    </div>
  </>);
}
