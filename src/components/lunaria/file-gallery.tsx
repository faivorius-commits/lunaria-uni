import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileAudio, FileText, FileVideo, ImageIcon, Plus, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteFile, formatBytes, kindOf, signedUrl, type UserFile } from "@/lib/files";
import { useRows, useMutate } from "@/lib/data";
import { useUpload } from "./upload";
import { Empty } from "./bits";

const icons = { image: ImageIcon, video: FileVideo, audio: FileAudio, pdf: FileText, text: FileText, other: FileText };

export function FileGallery({ filter, category, collectionId, emptyTitle }: {
  filter: (f: UserFile) => boolean; category: string; collectionId?: string | null; emptyTitle: string;
}) {
  const files = useRows("user_files");
  const collections = useRows("collections");
  const upload = useUpload();
  const qc = useQueryClient();
  const m = useMutate("user_files");
  const [preview, setPreview] = useState<{ file: UserFile; url: string } | null>(null);
  const [kind, setKind] = useState("all");
  const list = useMemo(() => (files.data ?? []).filter(filter).filter((f) => kind === "all" || kindOf(f.mime_type) === kind), [files.data, filter, kind]);

  async function open(file: UserFile) {
    try { setPreview({ file, url: await signedUrl(file.storage_path) }); } catch (e) { toast.error((e as Error).message); }
  }
  async function remove(file: UserFile) {
    if (!confirm(`Delete “${file.name}” forever?`)) return;
    try {
      await deleteFile(file);
      setPreview(null);
      await qc.invalidateQueries({ queryKey: ["user_files"] });
      toast.success("File deleted");
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <section className="panel p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="mr-auto"><b>Your saved items</b> <span className="text-sm text-muted-foreground">· {list.length}</span></div>
        <select aria-label="Filter by type" className="rounded-xl border bg-background px-3 py-1.5 text-sm" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="all">All types</option><option value="image">Photos</option><option value="video">Videos</option><option value="audio">Audio</option><option value="pdf">PDFs</option><option value="other">Documents</option>
        </select>
        <Button onClick={() => upload({ category, collectionId: collectionId ?? null })} className="rounded-full"><Plus /> Upload</Button>
      </div>
      {files.isLoading ? <p className="text-muted-foreground">Gathering your treasures…</p> : list.length === 0 ? (
        <Empty title={emptyTitle} text="Upload photos, music, videos and documents to start building your library." action={<Button className="rounded-full" onClick={() => upload({ category, collectionId: collectionId ?? null })}><Plus /> Add your first file</Button>} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((f) => { const I = icons[kindOf(f.mime_type)]; return (
            <button key={f.id} onClick={() => void open(f)} className="group rounded-2xl border bg-background/60 p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-2 grid aspect-square place-items-center rounded-xl bg-gradient-to-br from-lilac to-petal"><I className="size-8 text-accent-foreground" /></div>
              <b className="line-clamp-1 text-sm">{f.name}</b>
              <small className="text-muted-foreground">{f.category} · {formatBytes(f.size_bytes)}</small>
            </button>); })}
        </div>
      )}
      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl sm:max-w-3xl">
          {preview && <>
            <DialogHeader><DialogTitle className="break-all pr-6">{preview.file.name}</DialogTitle></DialogHeader>
            <MediaPreview file={preview.file} url={preview.url} />
            <label className="text-sm">Collection
              <select className="mt-1 w-full rounded-xl border bg-background px-3 py-2" value={preview.file.collection_id ?? ""}
                onChange={(e) => { const v = e.target.value || null; m.update.mutate({ id: preview.file.id, collection_id: v }); setPreview({ ...preview, file: { ...preview.file, collection_id: v } }); }}>
                <option value="">No collection</option>
                {(collections.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="rounded-full"><a href={preview.url} target="_blank" rel="noreferrer" download={preview.file.name}><Download /> Open / download</a></Button>
              <Button variant="destructive" className="rounded-full" onClick={() => void remove(preview.file)}><Trash2 /> Delete</Button>
            </div>
          </>}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function MediaPreview({ file, url }: { file: UserFile; url: string }) {
  const k = kindOf(file.mime_type);
  if (k === "image") return <img src={url} alt={file.name} className="max-h-[60dvh] w-full rounded-2xl object-contain" />;
  if (k === "video") return <video src={url} controls playsInline className="max-h-[60dvh] w-full rounded-2xl" />;
  if (k === "audio") return <div className="rounded-2xl bg-accent/50 p-6 text-center"><div className="mb-3 text-4xl floaty">♫</div><audio src={url} controls className="w-full" /></div>;
  if (k === "pdf" || k === "text") return <iframe src={url} title={file.name} className="h-[60dvh] w-full rounded-2xl border bg-background" />;
  return <p className="rounded-2xl bg-muted p-6 text-center text-muted-foreground">This file type can't be previewed here — use Open / download.</p>;
}
