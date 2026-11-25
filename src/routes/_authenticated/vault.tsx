import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/lunaria/app-shell";
import { FileGallery } from "@/components/lunaria/file-gallery";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/vault")({ head: pageHead("My Vault", "Your private home for important files."), component: V });
const CATS = new Set(["My Vault", "Documents"]);
function V() {
  return (<>
    <Hero title="My Vault" blurb="Your private home for important files. Only you can open them." />
    <FileGallery filter={(f) => CATS.has(f.category)} category="My Vault" emptyTitle="Your vault is empty" />
  </>);
}
