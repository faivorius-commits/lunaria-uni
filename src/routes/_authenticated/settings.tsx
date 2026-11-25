import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, LogOut, Palette, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Hero } from "@/components/lunaria/app-shell";
import { PanelTitle, fieldCls } from "@/components/lunaria/bits";
import { useProfile, useSaveProfile } from "@/lib/profile";
import { useRows } from "@/lib/data";
import { formatBytes } from "@/lib/files";
import { ensureRecord, isValidPin, makeRecord, verifyPin, writeRecord, type LockRecord } from "@/lib/pin-lock";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/settings")({ head: pageHead("Settings", "Make Lunaria feel like yours."), component: S });
const AVATARS = ["✿", "☾", "★", "♡", "🐰", "🦄", "🌷", "🧚", "🐱", "🌙"];

function S() {
  const profile = useProfile(); const save = useSaveProfile(); const files = useRows("user_files"); const nav = useNavigate();
  const [name, setName] = useState(""); useEffect(() => { if (profile.data) setName(profile.data.display_name); }, [profile.data?.id]);
  const [rec, setRec] = useState<LockRecord | null>(null); useEffect(() => { void ensureRecord().then(setRec); }, []);
  const [cur, setCur] = useState(""); const [next, setNext] = useState(""); const [conf, setConf] = useState("");
  const used = (files.data ?? []).reduce((a, f) => a + f.size_bytes, 0);

  async function changePin(e: React.FormEvent) {
    e.preventDefault(); if (!rec) return;
    if (!(await verifyPin(cur, rec))) return void toast.error("Current PIN isn't right.");
    if (!isValidPin(next)) return void toast.error("New PIN must be 4–8 digits.");
    if (next !== conf) return void toast.error("New PINs don't match.");
    const r = await makeRecord(next, rec.enabled, false); writeRecord(r); setRec(r); setCur(""); setNext(""); setConf(""); toast.success("PIN changed ✧");
  }
  return (<>
    <Hero title="Settings" blurb="Make Lunaria feel like yours." />
    <div className="grid gap-4 md:grid-cols-2">
      <section className="panel space-y-3 p-5">
        <PanelTitle icon={UserRound} title="Profile" />
        <label className="block text-sm">Display name<input className={`${fieldCls} mt-1`} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} /></label>
        <div className="flex flex-wrap gap-1.5">{AVATARS.map((a) => <button key={a} aria-label={`Avatar ${a}`} onClick={() => save.mutate({ avatar_emoji: a })} className={`grid size-10 place-items-center rounded-full text-xl ${profile.data?.avatar_emoji === a ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{a}</button>)}</div>
        <Button className="rounded-full" onClick={() => save.mutate({ display_name: name.trim() || "dreamer" }, { onSuccess: () => toast.success("Profile saved") })}>Save profile</Button>
      </section>
      <section className="panel space-y-3 p-5">
        <PanelTitle icon={Palette} title="Appearance & storage" tone="bg-lilac" />
        <label className="flex items-center justify-between text-sm">Night sky mode (dark)<Switch checked={profile.data?.prefs.theme === "dark"} onCheckedChange={(v) => save.mutate({ prefs: { theme: v ? "dark" : "light" } })} /></label>
        <p className="text-sm text-muted-foreground">You're using {formatBytes(used)} across {(files.data ?? []).length} files.</p>
        <Button variant="outline" className="rounded-full" onClick={async () => { await supabase.auth.signOut(); sessionStorage.removeItem("lunaria.unlocked"); await nav({ to: "/auth" }); }}><LogOut /> Sign out</Button>
      </section>
      <section className="panel space-y-3 p-5 md:col-span-2">
        <PanelTitle icon={KeyRound} title="App lock" tone="bg-sky" />
        <p className="text-sm text-muted-foreground">A quick PIN for this device only. It keeps casual eyes out — your account password still protects your data.</p>
        {rec?.isDefault && <p className="rounded-xl bg-butter/60 p-3 text-sm">You're still using the starting PIN. Please choose your own.</p>}
        <label className="flex items-center justify-between text-sm">Ask for PIN when opening Lunaria
          <Switch checked={!!rec?.enabled} onCheckedChange={(v) => { if (!rec) return; const r = { ...rec, enabled: v }; writeRecord(r); setRec(r); }} /></label>
        <form onSubmit={changePin} className="grid gap-2 sm:grid-cols-4">
          <input className={fieldCls} type="password" inputMode="numeric" placeholder="Current PIN" value={cur} onChange={(e) => setCur(e.target.value.replace(/\D/g, ""))} />
          <input className={fieldCls} type="password" inputMode="numeric" placeholder="New PIN" value={next} onChange={(e) => setNext(e.target.value.replace(/\D/g, ""))} />
          <input className={fieldCls} type="password" inputMode="numeric" placeholder="Repeat new PIN" value={conf} onChange={(e) => setConf(e.target.value.replace(/\D/g, ""))} />
          <Button className="rounded-full">Change PIN</Button>
        </form>
        <Button variant="ghost" className="rounded-full" onClick={() => window.dispatchEvent(new Event("lunaria:lock"))}>Lock now</Button>
      </section>
    </div>
  </>);
}
