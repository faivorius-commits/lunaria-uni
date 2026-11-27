import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const BUCKET = "lunaria-private";
export const MAX_BYTES = 50 * 1024 * 1024;
export type UserFile = Tables<"user_files">;

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function kindOf(mime: string): "image" | "video" | "audio" | "pdf" | "text" | "other" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("text/")) return "text";
  return "other";
}

export function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "file";
}

export async function uploadFiles(files: File[], category: string, collectionId: string | null) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Please sign in first.");
  const uid = auth.user.id;
  for (const file of files) {
    if (file.size > MAX_BYTES) throw new Error(`${file.name} is larger than 50 MB.`);
    const path = `${uid}/${crypto.randomUUID()}-${safeName(file.name)}`;
    const type = file.type || "application/octet-stream";
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: type, upsert: false });
    if (upErr) throw new Error(`${file.name}: ${upErr.message}`);
    const { error: rowErr } = await supabase.from("user_files").insert({
      user_id: uid, name: file.name, category, mime_type: type, size_bytes: file.size, storage_path: path, collection_id: collectionId,
    });
    if (rowErr) {
      await supabase.storage.from(BUCKET).remove([path]);
      throw new Error(rowErr.message);
    }
  }
}

export async function deleteFile(file: UserFile) {
  const { error: sErr } = await supabase.storage.from(BUCKET).remove([file.storage_path]);
  if (sErr) throw new Error(sErr.message);
  const { error } = await supabase.from("user_files").delete().eq("id", file.id);
  if (error) throw new Error(error.message);
}

export async function signedUrl(path: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
