import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { NAV } from "@/lib/nav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lunaria — a magical little universe for your life" },
      { name: "description", content: "Plan your days, keep a diary, grow a knowledge garden and store memories privately in Lunaria." },
      { property: "og:title", content: "Lunaria — a magical little universe for your life" },
      { property: "og:description", content: "Your dreamy all-in-one life organizer: workspace, diary, memories, vault and play." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { void supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session)); }, []);
  return (
    <div className="hero-gradient relative min-h-dvh overflow-hidden">
      <div className="starfield pointer-events-none absolute inset-0" />
      <span aria-hidden className="absolute top-16 right-[12%] text-7xl floaty">☾</span>
      <span aria-hidden className="absolute top-40 left-[10%] text-2xl text-primary twinkle">✦</span>
      <span aria-hidden className="absolute bottom-32 right-[20%] text-3xl text-primary twinkle [animation-delay:1.2s]">✧</span>
      <main className="relative mx-auto flex max-w-5xl flex-col items-center px-5 py-20 text-center sm:py-28">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-card/70 px-4 py-1.5 text-xs font-semibold tracking-widest">✿ YOUR LITTLE UNIVERSE</div>
        <h1 className="text-5xl sm:text-7xl">Lunaria</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">A dreamy home for your plans, thoughts, memories and favorite things — softly organized, privately kept.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-8"><Link to={signedIn ? "/home" : "/auth"}>{signedIn ? "Enter my universe" : "Begin my universe"}</Link></Button>
        </div>
        <div className="mt-14 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {NAV.slice(0, 12).map((n) => { const I = n.icon; return (
            <div key={n.to} className="panel flex flex-col items-center gap-2 p-4 text-sm"><I className="size-5 text-primary" />{n.label}</div>); })}
        </div>
      </main>
    </div>
  );
}
