import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  ImageIcon,
  Pencil,
  Trash2,
  Download,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRows, useMutate } from "@/lib/data";
import {
  deleteFile,
  signedUrl,
  uploadFiles,
  type UserFile,
  type MemoryMetadata,
} from "@/lib/files";
import { memoryMonth, memoryMatches } from "@/lib/memories";
import { MemoryFields, blankMemory } from "./memory-fields";
import { Empty, fieldCls } from "./bits";
export function MemoryImage({ file, large = false }: { file: UserFile; large?: boolean }) {
  const url = useQuery({
    queryKey: ["file-url", file.storage_path],
    queryFn: () => signedUrl(file.storage_path),
    staleTime: 50 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
  return url.data ? (
    <img
      src={url.data}
      alt={file.memory_title || file.name}
      loading={large ? "eager" : "lazy"}
      className={large ? "max-h-[65dvh] w-full object-contain" : ""}
    />
  ) : (
    <div className="photo-placeholder">
      <span className="text-sm text-muted-foreground">
        {url.isError ? "Photo unavailable" : "Opening photo…"}
      </span>
    </div>
  );
}
const meta = (f: UserFile): MemoryMetadata => ({
  memory_title: f.memory_title,
  memory_date: f.memory_date,
  caption: f.caption,
  memory_location: f.memory_location,
  memory_category: f.memory_category,
  memory_tags: f.memory_tags,
});
export function PhotoAlbum() {
  const files = useRows("user_files");
  const mutation = useMutate("user_files");
  const qc = useQueryClient();
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<MemoryMetadata>(blankMemory);
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const all = (files.data ?? []).filter(
    (f) => f.category === "Memories" && f.mime_type.startsWith("image/"),
  );
  const list = all
    .filter((f) => memoryMatches(f, year, month, category))
    .sort(
      (a, b) =>
        (b.memory_date ?? "").localeCompare(a.memory_date ?? "") ||
        b.created_at.localeCompare(a.created_at),
    );
  const groups = [...new Set(list.map(memoryMonth))];
  const years = [...new Set(all.flatMap((f) => (f.memory_date ? [f.memory_date.slice(0, 4)] : [])))]
    .sort()
    .reverse();
  const categories = [...new Set(all.map((f) => f.memory_category).filter(Boolean))].sort();
  const file = all.find((f) => f.id === selected);
  const index = list.findIndex((f) => f.id === selected);
  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["user_files"] }),
      qc.invalidateQueries({ queryKey: ["activity_logs"] }),
    ]);
  function add() {
    setForm(blankMemory());
    setPhotos([]);
    setError("");
    setAdding(true);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.memory_date) {
      setError("Please choose the date of this memory.");
      return;
    }
    if (adding && !photos.length) {
      setError("Choose at least one photo.");
      return;
    }
    if (photos.some((p) => !p.type.startsWith("image/"))) {
      setError("Please choose image files for your photo album.");
      return;
    }
    setBusy(true);
    try {
      const metadata = {
        ...form,
        memory_tags: [...new Set(form.memory_tags.map((t) => t.trim()).filter(Boolean))],
      };
      if (adding) await uploadFiles(photos, "Memories", null, metadata);
      else if (file) await mutation.update.mutateAsync({ id: file.id, ...metadata });
      await refresh();
      setAdding(false);
      setEditing(false);
      toast.success(adding ? "Your memories are safely kept" : "Memory updated");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Your memory could not be saved.");
    } finally {
      setBusy(false);
      await refresh();
    }
  }
  async function remove() {
    if (!file || !confirm(`Delete “${file.memory_title || file.name}” and its original photo?`))
      return;
    setBusy(true);
    try {
      await deleteFile(file);
      setSelected(null);
      await refresh();
      toast.success("Memory deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete memory");
    } finally {
      setBusy(false);
    }
  }
  const monthName = (g: string) =>
    g === "undated"
      ? "Undated memories"
      : new Date(`${g}-01T00:00:00`).toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        });
  return (
    <>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <span className="mr-auto self-center text-sm text-muted-foreground">
          {all.length} photographs · {years.length} years of little moments
        </span>
        <Button onClick={add}>
          <Plus />
          Add memory
        </Button>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <select
          aria-label="Filter memory year"
          className={fieldCls}
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
        <select
          aria-label="Filter memory month"
          className={fieldCls}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <option value="">All months</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={String(i + 1).padStart(2, "0")}>
              {new Date(2000, i, 1).toLocaleDateString(undefined, { month: "long" })}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter memory category"
          className={fieldCls}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {groups.length > 0 && (
        <nav aria-label="Memory timeline" className="album-timeline">
          {groups.map((g) => (
            <a key={g} className="shrink-0 text-sm text-primary" href={`#album-${g}`}>
              {monthName(g)}
            </a>
          ))}
        </nav>
      )}
      {files.isLoading ? (
        <p className="py-10 text-center">Opening your album…</p>
      ) : files.isError ? (
        <p role="alert" className="text-destructive">
          Your photos could not load.{" "}
          <Button variant="outline" onClick={() => void files.refetch()}>
            Try again
          </Button>
        </p>
      ) : !list.length ? (
        <Empty
          title={all.length ? "No moments in this chapter" : "Some moments deserve to stay"}
          text={
            all.length
              ? "Try another year, month or category."
              : "Your first photograph is the beginning of an album."
          }
          action={
            <Button onClick={add}>
              <ImageIcon />
              Add a memory
            </Button>
          }
        />
      ) : (
        groups.map((g) => (
          <section className="album-month" id={`album-${g}`} key={g}>
            <header>
              <h2>{monthName(g)}</h2>
              <span className="text-sm text-muted-foreground">
                {list.filter((f) => memoryMonth(f) === g).length}
              </span>
            </header>
            <div className="photo-columns">
              {list
                .filter((f) => memoryMonth(f) === g)
                .map((f) => (
                  <article key={f.id} className="photo-object">
                    <Button
                      variant="ghost"
                      className="block h-auto w-full p-0 hover:bg-transparent"
                      onClick={() => {
                        setSelected(f.id);
                        setEditing(false);
                        setError("");
                      }}
                      aria-label={`Open memory ${f.memory_title || f.name}`}
                    >
                      <MemoryImage file={f} />
                    </Button>
                    <div className="px-2 pt-3">
                      <h3 className="break-words text-xl">{f.memory_title || f.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {f.memory_date
                          ? new Date(`${f.memory_date}T00:00:00`).toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "No memory date"}
                        {f.memory_location && ` · ${f.memory_location}`}
                      </p>
                      {f.caption && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {f.caption}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ))
      )}
      <Dialog
        open={adding || !!file}
        onOpenChange={(v) => {
          if (!v && !busy) {
            setAdding(false);
            setSelected(null);
            setEditing(false);
          }
        }}
      >
        <DialogContent
          className={`max-h-[94dvh] overflow-y-auto ${adding || editing ? "sm:max-w-lg" : "sm:max-w-5xl"}`}
        >
          <DialogHeader>
            <DialogTitle className="break-words pr-6 text-2xl">
              {adding
                ? "Keep a little memory"
                : editing
                  ? "Edit memory"
                  : file?.memory_title || file?.name}
            </DialogTitle>
            <DialogDescription>
              {adding
                ? "A photograph, a date, a story."
                : editing
                  ? "Keep the date and details true to your moment."
                  : file?.memory_date
                    ? new Date(`${file.memory_date}T00:00:00`).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Undated memory"}
            </DialogDescription>
          </DialogHeader>
          {adding || editing ? (
            <form className="space-y-4" onSubmit={save}>
              {adding && (
                <label className="block rounded-lg border border-dashed p-4 text-sm">
                  Photographs
                  <input
                    aria-label="Memory photos"
                    className="mt-2 block w-full text-sm"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
                  />
                  <span className="mt-2 block text-xs text-muted-foreground">
                    Original photos · up to 50 MB each
                  </span>
                </label>
              )}
              <MemoryFields value={form} onChange={setForm} />
              {error && (
                <p role="alert" className="text-destructive">
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <Button disabled={busy} className="flex-1">
                  {busy ? "Saving…" : adding ? "Save memory" : "Save changes"}
                </Button>
                {editing && (
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          ) : (
            file && (
              <>
                <div className="relative">
                  <MemoryImage file={file} large />
                  {list.length > 1 && (
                    <div className="mt-3 flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Previous memory"
                        disabled={index <= 0}
                        onClick={() => setSelected(list[index - 1]?.id ?? null)}
                      >
                        <ChevronLeft />
                      </Button>
                      <span className="text-sm">
                        {index + 1} / {list.length}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Next memory"
                        disabled={index >= list.length - 1}
                        onClick={() => setSelected(list[index + 1]?.id ?? null)}
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                  )}
                </div>
                {file.caption && <p className="whitespace-pre-wrap break-words">{file.caption}</p>}
                {file.memory_location && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    {file.memory_location}
                  </p>
                )}
                <p className="flex flex-wrap gap-2 text-xs text-primary">
                  {[file.memory_category, ...file.memory_tags].filter(Boolean).map((t, i) => (
                    <span key={`${t}-${i}`}>#{t}</span>
                  ))}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setForm(meta(file));
                      setError("");
                      setEditing(true);
                    }}
                  >
                    <Pencil />
                    Edit details
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        window.open(
                          await signedUrl(file.storage_path),
                          "_blank",
                          "noopener,noreferrer",
                        );
                      } catch {
                        toast.error("Could not open the original photo.");
                      }
                    }}
                  >
                    <Download />
                    Original photo
                  </Button>
                  <Button variant="destructive" disabled={busy} onClick={() => void remove()}>
                    <Trash2 />
                    Delete
                  </Button>
                </div>
              </>
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
