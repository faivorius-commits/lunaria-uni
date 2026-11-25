import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, Json } from "@/integrations/supabase/types";

export type Prefs = { theme?: "light" | "dark"; arcadeBest?: number; weatherCity?: string; randomList?: string[] };
export type Profile = Tables<"profiles"> & { prefs: Prefs };

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      let { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      if (!data) {
        const ins = await supabase.from("profiles").insert({ id: u.user.id }).select("*").single();
        data = ins.data;
      }
      if (!data) return null;
      return { ...data, prefs: (data.preferences ?? {}) as Prefs };
    },
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: { display_name?: string; avatar_emoji?: string; prefs?: Prefs }) => {
      const current = qc.getQueryData<Profile | null>(["profile"]);
      if (!current) throw new Error("Not signed in");
      const { prefs, ...rest } = patch;
      const { error } = await supabase.from("profiles").update({
        ...rest,
        ...(prefs ? { preferences: { ...current.prefs, ...prefs } as Json } : {}),
      }).eq("id", current.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}
