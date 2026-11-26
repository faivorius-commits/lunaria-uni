import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/lunaria/app-shell";
import { FileGallery } from "@/components/lunaria/file-gallery";
import { PhotoAlbum } from "@/components/lunaria/photo-album";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageIcon, Music2 } from "lucide-react";
import { pageHead } from "@/lib/head";
export const Route = createFileRoute("/_authenticated/memories")({
  head: pageHead(
    "Memories",
    "A private photo album of your life, arranged by the dates that matter.",
  ),
  component: Memories,
});
function Memories() {
  return (
    <>
      <Hero title="Memories" blurb="Not just photographs. Little pieces of your world." />
      <Tabs defaultValue="photos">
        <TabsList className="mb-6">
          <TabsTrigger value="photos">
            <ImageIcon />
            Photo album
          </TabsTrigger>
          <TabsTrigger value="media">
            <Music2 />
            Music & videos
          </TabsTrigger>
        </TabsList>
        <TabsContent value="photos">
          <PhotoAlbum />
        </TabsContent>
        <TabsContent value="media">
          <FileGallery
            filter={(f) =>
              ["Memories", "Music", "Videos"].includes(f.category) &&
              !f.mime_type.startsWith("image/")
            }
            category="Videos"
            emptyTitle="A place for sounds and moving moments"
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
