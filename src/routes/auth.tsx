import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { fieldCls } from "@/components/lunaria/bits";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Sign in — Lunaria" },
    { name: "description", content: "Sign in or create your private Lunaria universe." },
    { property: "og:title", content: "Sign in — Lunaria" },
    { property: "og:description", content: "Step into your private little universe." },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [name, setName] = useState("");
  const [busy, setBusy] = useState(false); const [sent, setSent] = useState("");
  const nav = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error; await nav({ to: "/home" });
      } else if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/home", data: { display_name: name } } });
        if (error) throw error;
        if (data.session) await nav({ to: "/home" }); else setSent("Check your email to confirm your account, then sign in ✧");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
        if (error) throw error; setSent("A reset link is on its way to your inbox.");
      }
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  }
  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) { toast.error(String((r.error as Error).message ?? r.error)); return; }
    if (r.redirected) return;
    await nav({ to: "/home" });
  }

  return (
    <div className="hero-gradient relative grid min-h-dvh place-items-center px-4 py-10">
      <div className="starfield pointer-events-none absolute inset-0" />
      <div className="panel relative w-full max-w-sm p-6">
        <div className="mb-4 text-center"><div className="text-4xl floaty">☾</div><h1 className="text-3xl">Lunaria</h1>
          <p className="text-sm text-muted-foreground">{mode === "up" ? "Create your little universe" : mode === "reset" ? "Reset your password" : "Welcome back, dreamer"}</p></div>
        {sent ? <p className="rounded-2xl bg-accent/60 p-4 text-center text-sm">{sent}</p> : (
          <form onSubmit={submit} className="space-y-3">
            {mode === "up" && <input className={fieldCls} placeholder="What should we call you?" value={name} onChange={(e) => setName(e.target.value)} />}
            <input className={fieldCls} type="email" required placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {mode !== "reset" && <input className={fieldCls} type="password" required minLength={6} placeholder="Password" autoComplete={mode === "up" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} />}
            <Button className="w-full rounded-full" disabled={busy}>{busy ? "One moment…" : mode === "up" ? "Create my account" : mode === "reset" ? "Send reset link" : "Enter Lunaria"}</Button>
          </form>
        )}
        {mode !== "reset" && !sent && <>
          <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <button type="button" onClick={() => void google()} className="flex w-full items-center justify-center gap-2.5 rounded-full border border-[#747775] bg-[#FFFFFF] px-3 py-2 text-sm font-medium text-[#1F1F1F]">
            <svg aria-hidden="true" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
            Continue with Google
          </button>
        </>}
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
          {mode !== "in" && <button className="text-primary underline-offset-2 hover:underline" onClick={() => { setMode("in"); setSent(""); }}>I have an account</button>}
          {mode !== "up" && <button className="text-primary underline-offset-2 hover:underline" onClick={() => { setMode("up"); setSent(""); }}>Create an account</button>}
          {mode === "in" && <button className="text-muted-foreground hover:underline" onClick={() => setMode("reset")}>Forgot password?</button>}
        </div>
      </div>
    </div>
  );
}
