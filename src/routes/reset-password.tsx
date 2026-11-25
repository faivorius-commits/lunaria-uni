import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fieldCls } from "@/components/lunaria/bits";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Choose a new password — Lunaria" }, { name: "description", content: "Set a new password for your Lunaria account." }, { property: "og:title", content: "Choose a new password — Lunaria" }, { property: "og:description", content: "Set a new password for Lunaria." }] }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState(""); const nav = useNavigate();
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated ✧"); await nav({ to: "/home" });
  }
  return (
    <div className="hero-gradient grid min-h-dvh place-items-center px-4">
      <form onSubmit={save} className="panel w-full max-w-sm space-y-3 p-6 text-center">
        <h1 className="text-2xl">A fresh new password</h1>
        <input className={fieldCls} type="password" minLength={6} required placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <Button className="w-full rounded-full">Save password</Button>
      </form>
    </div>
  );
}
