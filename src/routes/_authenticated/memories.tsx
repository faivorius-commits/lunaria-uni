import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/lunaria/app-shell";
import { FileGallery } from "@/components/lunaria/file-gallery";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/memories")({ head: pageHead("Memories", "Keep the moments you want to revisit."), component: M });
const CATS = new Set(["Memories", "Music", "Videos"]);
function M() {
  return (<>
    <Hero title="Memories" blurb="Keep the moments you want to revisit — photos, videos and songs." />
    <FileGallery filter={(f) => CATS.has(f.category)} category="Memories" emptyTitle="Your memories are waiting" />
  </>);
}
