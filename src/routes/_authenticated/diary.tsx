import { createFileRoute } from "@tanstack/react-router";
import { BookHeart } from "lucide-react";
import { Hero } from "@/components/lunaria/app-shell";
import { NotesRoom } from "@/components/lunaria/notes-room";
import { useMutate, useRows } from "@/lib/data";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/diary")({ head: pageHead("My Diary", "A quiet space for your thoughts."), component: D });
function D() {
  const entries = useRows("diary_entries"); const m = useMutate("diary_entries");
  return (<>
    <Hero title="My Diary" blurb="A quiet space for your thoughts." />
    <NotesRoom icon={BookHeart} formTitle="Write a little entry" listTitle="Your diary pages" extraLabel="Mood" extraOptions={["🌸", "☀️", "🌙", "☁️", "🌧️", "✨"]} bodyPlaceholder="Dear diary…"
      items={(entries.data ?? []).map((e) => ({ ...e, extra: e.mood }))}
      onSave={({ id, title, body, extra }) => id ? m.update.mutate({ id, title, body, mood: extra }) : m.insert.mutate({ title, body, mood: extra })}
      onDelete={(id) => m.remove.mutate(id)} />
  </>);
}
