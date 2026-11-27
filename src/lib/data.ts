import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type T = Database["public"]["Tables"];
export type TableName = keyof T;
export type Row<N extends TableName> = T[N]["Row"];

export function useRows<N extends TableName>(table: N, orderBy = "created_at", ascending = false) {
  return useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await (supabase.from(table) as any).select("*").order(orderBy, { ascending }).limit(500);
      if (error) throw new Error(error.message);
      return (data ?? []) as Row<N>[];
    },
  });
}

export function useMutate<N extends TableName>(table: N) {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: [table] });
  const fail = (e: Error) => toast.error(e.message);
  const run = async (p: PromiseLike<{ error: { message: string } | null }>) => {
    const { error } = await p;
    if (error) throw new Error(error.message);
  };
  const from = () => supabase.from(table) as any;
  return {
    insert: useMutation({ mutationFn: (v: T[N]["Insert"]) => run(from().insert(v)), onSuccess: done, onError: fail }),
    update: useMutation({ mutationFn: ({ id, ...v }: { id: string } & T[N]["Update"]) => run(from().update(v).eq("id", id)), onSuccess: done, onError: fail }),
    remove: useMutation({ mutationFn: (id: string) => run(from().delete().eq("id", id)), onSuccess: done, onError: fail }),
  };
}

export function todayISO(d = new Date()) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}
