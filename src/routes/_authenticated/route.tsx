import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/lunaria/app-shell";
import { UploadProvider } from "@/components/lunaria/upload";
import { LockGate } from "@/components/lunaria/lock-gate";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: () => (
    <LockGate>
      <UploadProvider>
        <AppShell><Outlet /></AppShell>
      </UploadProvider>
    </LockGate>
  ),
});
