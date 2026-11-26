import { createFileRoute } from "@tanstack/react-router";
import { BookHeart, History } from "lucide-react";
import { Hero } from "@/components/lunaria/app-shell";
import { NotesRoom } from "@/components/lunaria/notes-room";
import { ActivityTimeline } from "@/components/lunaria/activity-timeline";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMutate, useRows } from "@/lib/data";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/_authenticated/diary")({
  head: pageHead(
    "My Diary",
    "Your real moments, recorded in time. An activity timeline and personal journal.",
  ),
  component: Diary,
});
function Diary() {
  const entries = useRows("diary_entries");
  const m = useMutate("diary_entries");
  return (
    <>
      <Hero title="My Diary" blurb="The little moments that make a life." />
      <Tabs defaultValue="activity">
        <TabsList className="mb-7">
          <TabsTrigger value="activity">
            <History />
            Activity timeline
          </TabsTrigger>
          <TabsTrigger value="journal">
            <BookHeart />
            My journal
          </TabsTrigger>
        </TabsList>
        <TabsContent value="activity">
          <ActivityTimeline />
        </TabsContent>
        <TabsContent value="journal">
          <NotesRoom
            icon={BookHeart}
            formTitle="Write a little entry"
            listTitle="Your diary pages"
            extraLabel="Mood"
            extraOptions={["🌸", "☀️", "🌙", "☁️", "🌧️", "✨"]}
            bodyPlaceholder="Dear diary…"
            items={(entries.data ?? []).map((e) => ({ ...e, extra: e.mood }))}
            onSave={({ id, title, body, extra }) =>
              id
                ? m.update.mutate({ id, title, body, mood: extra })
                : m.insert.mutate({ title, body, mood: extra })
            }
            onDelete={(id) => m.remove.mutate(id)}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
