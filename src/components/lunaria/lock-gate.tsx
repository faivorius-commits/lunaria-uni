import { useEffect, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ensureRecord, verifyPin, type LockRecord } from "@/lib/pin-lock";

const SESSION_KEY = "lunaria.unlocked";

export function LockGate({ children }: { children: ReactNode }) {
  const [rec, setRec] = useState<LockRecord | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    void ensureRecord().then((r) => {
      setRec(r);
      setUnlocked(!r.enabled || sessionStorage.getItem(SESSION_KEY) === "1");
    });
    const onLock = () => { sessionStorage.removeItem(SESSION_KEY); void ensureRecord().then((r) => { setRec(r); setUnlocked(!r.enabled); }); };
    window.addEventListener("lunaria:lock", onLock);
    return () => window.removeEventListener("lunaria:lock", onLock);
  }, []);

  async function submit(value: string) {
    if (!rec) return;
    if (await verifyPin(value, rec)) { sessionStorage.setItem(SESSION_KEY, "1"); setUnlocked(true); setPin(""); setErr(""); }
    else { setErr("That isn't quite right — try again."); setPin(""); }
  }

  if (!rec) return null;
  if (unlocked) return <>{children}</>;
  const press = (d: string) => { const v = (pin + d).slice(0, 8); setPin(v); setErr(""); };
  return (
    <div className="hero-gradient relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div className="starfield pointer-events-none absolute inset-0" />
      <form onSubmit={(e) => { e.preventDefault(); void submit(pin); }} className="panel relative w-full max-w-xs p-6 text-center">
        <div className="mx-auto mb-2 grid size-14 place-items-center rounded-full bg-accent text-2xl floaty">☾</div>
        <h1 className="text-2xl">Lunaria is resting</h1>
        <p className="mb-4 text-sm text-muted-foreground">Enter your PIN to step back in.</p>
        <input aria-label="PIN" inputMode="numeric" autoFocus type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
          className="mb-2 w-full rounded-2xl border bg-background py-3 text-center text-2xl tracking-[0.5em]" />
        {err && <p className="mb-2 text-sm text-destructive">{err}</p>}
        <div className="mb-3 grid grid-cols-3 gap-2">
          {["1","2","3","4","5","6","7","8","9"].map((d) => <button type="button" key={d} onClick={() => press(d)} className="rounded-2xl bg-secondary py-3 text-lg font-medium hover:bg-accent">{d}</button>)}
          <button type="button" onClick={() => setPin(pin.slice(0, -1))} className="rounded-2xl py-3 text-sm text-muted-foreground">⌫</button>
          <button type="button" onClick={() => press("0")} className="rounded-2xl bg-secondary py-3 text-lg font-medium hover:bg-accent">0</button>
          <span />
        </div>
        <Button type="submit" className="w-full rounded-full"><Lock /> Unlock</Button>
        {rec.isDefault && <p className="mt-3 text-xs text-muted-foreground">First time? Your starting PIN is the one you chose for Lunaria. Change it in Settings.</p>}
      </form>
    </div>
  );
}
