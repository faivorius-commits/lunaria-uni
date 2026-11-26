import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LockKeyhole, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FILE_CATEGORIES } from "@/lib/nav";
import { uploadFiles } from "@/lib/files";
import { useRows } from "@/lib/data";
import { MemoryFields, blankMemory } from "./memory-fields";

type Opts = { category?: string; collectionId?: string | null };
const Ctx = createContext<(o?: Opts) => void>(() => {});
export const useUpload = () => useContext(Ctx);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("Memories");
  const [collectionId, setCollectionId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [memory, setMemory] = useState(blankMemory);
  const input = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const collections = useRows("collections");

  const show = (o?: Opts) => {
    setCategory(o?.category ?? "Memories");
    setCollectionId(o?.collectionId ?? "");
    setMemory(blankMemory());
    setOpen(true);
  };

  async function handle(list: FileList | null) {
    if (!list?.length) return;
    const files = Array.from(list);
    setBusy(true);
    setProgress(`Uploading ${files.length} file(s)…`);
    try {
      await uploadFiles(files, category, collectionId || null, category === "Memories" ? { ...memory, memory_tags: memory.memory_tags.map(t => t.trim()).filter(Boolean) } : undefined);
      await qc.invalidateQueries({ queryKey: ["user_files"] });
      toast.success(`${files.length} file(s) tucked safely into ${category} ✧`);
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      await Promise.all([qc.invalidateQueries({ queryKey: ["user_files"] }), qc.invalidateQueries({ queryKey: ["activity_logs"] })]);
      setBusy(false);
      setProgress("");
      if (input.current) input.current.value = "";
    }
  }

  return (
    <Ctx.Provider value={show}>
      {children}
      <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <div className="text-3xl text-primary twinkle">✧</div>
            <DialogTitle className="text-2xl">Add to your universe</DialogTitle>
            <DialogDescription>Keep your favorite files safe in your little corner.</DialogDescription>
          </DialogHeader>
          <label className="text-sm font-medium">Choose a place
            <select className="mt-1 w-full rounded-xl border bg-background px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
              {FILE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">Collection (optional)
            <select className="mt-1 w-full rounded-xl border bg-background px-3 py-2" value={collectionId} onChange={(e) => setCollectionId(e.target.value)}>
              <option value="">No collection</option>
              {(collections.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </label>
          {category === "Memories" && <MemoryFields value={memory} onChange={setMemory} />}
          <Button type="button" variant="outline" disabled={busy} onClick={() => input.current?.click()}
            className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-accent/40 px-4 py-8 text-center transition hover:bg-accent disabled:opacity-60">
            <UploadCloud className="size-8 text-primary" />
            <b>{busy ? progress : "Choose files to upload"}</b>
            <span className="text-xs text-muted-foreground">Photos · Videos · Audio · Music · PDFs · Documents — up to 50 MB each</span>
          </Button>
          <input ref={input} type="file" multiple hidden accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.md,.csv,.ppt,.pptx,.xls,.xlsx" onChange={(e) => void handle(e.target.files)} />
          <p className="flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" /> Stored privately — only you can open these files.</p>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Maybe later</Button>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}
