import { createFileRoute } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import { Hero } from "@/components/lunaria/app-shell";
import { NotesRoom } from "@/components/lunaria/notes-room";
import { FileGallery } from "@/components/lunaria/file-gallery";
import { useMutate, useRows } from "@/lib/data";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/knowledge")({ head: pageHead("Knowledge Garden", "Plant a thought. Grow a whole library."), component: K });
function K() {
  const notes = useRows("knowledge_notes"); const m = useMutate("knowledge_notes");
  const tags = (s: string) => s.split(",").map((t) => t.trim()).filter(Boolean);
  return (<>
    <Hero title="Knowledge Garden" blurb="Plant a thought. Grow a whole library." />
    <NotesRoom icon={Sprout} formTitle="Plant a new thought" listTitle="Growing ideas" extraLabel="Tags, separated by commas" bodyPlaceholder="Write an idea, fact, quote, or something you learned…"
      items={(notes.data ?? []).map((n) => ({ ...n, extra: n.tags.join(", ") }))}
      onSave={({ id, title, body, extra }) => id ? m.update.mutate({ id, title, body, tags: tags(extra) }) : m.insert.mutate({ title, body, tags: tags(extra) })}
      onDelete={(id) => m.remove.mutate(id)} />
    <div className="mt-6"><FileGallery filter={(f) => f.category === "Knowledge"} category="Knowledge" emptyTitle="No study files yet" /></div>
  </>);
}
