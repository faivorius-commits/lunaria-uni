import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Lock, Menu, Plus, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { GROUPS, NAV, SETTINGS } from "@/lib/nav";
import { useProfile } from "@/lib/profile";
import { useRows } from "@/lib/data";
import { useUpload } from "./upload";

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const loc = useLocation();
  const item = (n: typeof SETTINGS) => {
    const I = n.icon; const active = loc.pathname === n.to;
    return (
      <Link key={n.to} to={n.to} onClick={onNavigate}
        className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition ${active ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-sm ring-1 ring-primary/20 border-l-4 border-primary" : "hover:bg-sidebar-accent/60"}`}>
        <I className="size-4" /><span>{n.label}</span>
        {n.label === "Arcade" && <span className="ml-auto rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">NEW</span>}
      </Link>
    );
  };
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <Link to="/home" onClick={onNavigate} className="flex items-center gap-3 px-2">
        <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-lilac text-lg text-primary-foreground shadow">✦</span>
        <span><span className="block font-display text-xl">Lunaria</span><span className="block text-xs text-muted-foreground">your little universe ♡</span></span>
      </Link>
      <nav className="flex-1 space-y-4 overflow-y-auto">
        {GROUPS.map((g) => (
          <div key={g}>
            <div className="mb-1 px-3 text-[11px] font-semibold tracking-widest text-muted-foreground">{g}</div>
            <div className="space-y-0.5">{NAV.filter((n) => n.group === g).map(item)}</div>
          </div>
        ))}
      </nav>
      <div className="rounded-2xl bg-accent/50 p-3 text-center">
        <div className="text-lg">૮ ˶ᵔ ᵕ ᵔ˶ ა</div>
        <div className="text-xs text-muted-foreground">A little space just for you.</div>
      </div>
      {item(SETTINGS)}
    </div>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const files = useRows("user_files"); const notes = useRows("knowledge_notes"); const diary = useRows("diary_entries"); const tasks = useRows("lunaria_tasks");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase(); if (s.length < 2) return [];
    const hit = (t: string) => t.toLowerCase().includes(s);
    return [
      ...NAV.filter((n) => hit(n.label)).map((n) => ({ k: n.to, label: n.label, where: "Room", to: n.to })),
      ...(files.data ?? []).filter((f) => hit(f.name)).map((f) => ({ k: f.id, label: f.name, where: f.category, to: f.category === "My Vault" ? "/vault" : "/memories" })),
      ...(notes.data ?? []).filter((n) => hit(n.title + n.body)).map((n) => ({ k: n.id, label: n.title, where: "Knowledge", to: "/knowledge" })),
      ...(diary.data ?? []).filter((n) => hit(n.title + n.body)).map((n) => ({ k: n.id, label: n.title, where: "Diary", to: "/diary" })),
      ...(tasks.data ?? []).filter((n) => hit(n.title)).map((n) => ({ k: n.id, label: n.title, where: "Task", to: "/workspace" })),
    ].slice(0, 8);
  }, [q, files.data, notes.data, diary.data, tasks.data]);
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-xs">
      <label className="flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-sm">
        <Search className="size-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your universe…" className="w-full min-w-0 bg-transparent outline-none" />
      </label>
      {results.length > 0 && (
        <div className="panel absolute right-0 left-0 z-30 mt-2 p-1">
          {results.map((r) => (
            <button key={r.k} onClick={() => { setQ(""); void nav({ to: r.to }); }} className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-accent">
              <span className="truncate">{r.label}</span><span className="shrink-0 text-xs text-muted-foreground">{r.where}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const profile = useProfile();
  const upload = useUpload();
  const current = [...NAV, SETTINGS].find((n) => n.to === loc.pathname);

  useEffect(() => {
    const dark = profile.data?.prefs.theme === "dark";
    document.documentElement.classList.toggle("dark", dark);
  }, [profile.data?.prefs.theme]);

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground backdrop-blur lg:block"><SideNav /></aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground"><SheetTitle className="sr-only">Menu</SheetTitle><SideNav onNavigate={() => setOpen(false)} /></SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b bg-background/70 px-3 py-2.5 backdrop-blur sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></Button>
          <div className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">Lunaria <ChevronRight className="size-3" /> <span className="text-foreground">{current?.label ?? ""}</span></div>
          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
            <GlobalSearch />
            <Button size="icon" className="rounded-full" aria-label="Add or upload" onClick={() => upload()}><Plus /></Button>
            <Button variant="ghost" size="icon" aria-label="Lock Lunaria" onClick={() => window.dispatchEvent(new Event("lunaria:lock"))}><Lock /></Button>
            <Link to="/settings" aria-label="Profile and settings" className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-petal to-lilac text-lg">{profile.data?.avatar_emoji ?? "✿"}</Link>
          </div>
        </header>
        <main key={loc.pathname} className="page-enter mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-8 sm:py-6">{children}</main>
        <footer className="pb-6 text-center text-sm text-muted-foreground">Made of little things and a little magic <span className="text-primary">✧</span></footer>
      </div>
    </div>
  );
}

export function Hero({ title, blurb, action }: { title: string; blurb: string; action?: ReactNode }) {
  return (
    <section className="room-hero">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <div className="room-kicker">Lunaria / your little universe</div>
          <h1 className="break-words">{title}<span className="room-mark"> ✧</span></h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{blurb}</p>
        </div>
        {action}
      </div>
    </section>
  );
}
