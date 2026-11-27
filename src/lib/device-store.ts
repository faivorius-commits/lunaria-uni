import { openDB, type DBSchema } from "idb";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
type Table = keyof Tables;
type Values = Record<string, unknown>;
type Stored = { key: string; table: Table; value: Values };
interface DeviceDatabase extends DBSchema {
  records: { key: string; value: Stored; indexes: { table: Table } };
  originals: { key: string; value: Blob };
}

export const DEVICE_ID = "this-device";
// Open only when called by a query or event, never during module evaluation.
function database() {
  return openDB<DeviceDatabase>("lunaria-device-v1", 1, {
    upgrade(db) {
      db.createObjectStore("records", { keyPath: "key" }).createIndex("table", "table");
      db.createObjectStore("originals");
    },
  });
}

function defaults(table: Table): Values {
  const today = new Date().toLocaleDateString("en-CA");
  const byTable: Partial<Record<Table, Values>> = {
    profiles: { display_name: "dreamer", avatar_emoji: "✿", preferences: {} },
    lunaria_tasks: { description: "", due_date: null, done: false, task_type: "small", status: "active", progress: 0, labels: [], assigned_by: "", completed_at: null },
    garden_habits: { emoji: "🌱", frequency: "daily", frequency_mode: "target", frequency_target: 1, target_days: [] },
    habit_checkins: { day: today },
    collections: { description: "", emoji: "✿" },
    daily_logs: { day: today, mood: "", intention: "", gratitude: "", water: 0 },
    diary_entries: { title: "", mood: "" },
    knowledge_notes: { tags: [] },
    calendar_events: { note: "", start_time: null },
    explore_links: { note: "" },
    recipes: { category: "Other", description: "", difficulty: "Easy", prep_minutes: 0, cook_minutes: 0, ingredients: [], tools: [], steps: [] },
    task_progress_logs: { log_date: today, progress_percent: 0 },
    user_files: { category: "Memories", collection_id: null, caption: "", memory_title: "", memory_date: null, memory_location: "", memory_category: "", memory_tags: [], mime_type: "application/octet-stream", size_bytes: 0 },
  };
  return byTable[table] ?? {};
}

function activity(table: Table, row: Values, previous: Values | undefined, removed: boolean) {
  const categories: Partial<Record<Table, [string, string]>> = {
    lunaria_tasks: ["workspace", "Task"], task_progress_logs: ["workspace", "Task progress"],
    garden_habits: ["habits", "Habit"], habit_checkins: ["habits", "Habit completion"],
    user_files: ["memories", "File"], recipes: ["recipes", "Recipe"], diary_entries: ["diary", "Diary entry"],
    collections: ["collections", "Collection"], knowledge_notes: ["knowledge", "Knowledge note"],
    daily_logs: ["daily", "Daily record"], calendar_events: ["calendar", "Calendar event"], explore_links: ["explore", "Link"],
  };
  const category = categories[table];
  if (!category) return null;
  let verb = removed ? "deleted" : previous ? "updated" : "created";
  if (!removed && table === "lunaria_tasks") {
    if (row['done'] === true && previous?.['done'] !== true) verb = "completed";
    else if (row['status'] === "failed" && previous?.['status'] !== "failed") verb = "moved to failed archive";
    else if (previous && row['progress'] !== previous['progress']) verb = "progress updated";
  }
  if (!removed && table === "garden_habits" && previous && ["frequency", "frequency_mode", "frequency_target", "target_days"].some(k => JSON.stringify(row[k]) !== JSON.stringify(previous[k]))) verb = "frequency changed";
  if (table === "habit_checkins" && !removed) verb = "recorded";
  const label = table === "user_files" && row['category'] === "Memories" ? "Memory" : category[1];
  return { id: crypto.randomUUID(), user_id: DEVICE_ID, activity_type: category[0], title: `${label} ${verb}`, description: String(row['memory_title'] || row['title'] || row['name'] || row['progress_note'] || row['day'] || ""), entity_type: table, entity_id: row['id'], created_at: new Date().toISOString() };
}

type Result<N extends Table> = { data: Tables[N]["Row"][]; error: { message: string } | null };

class DeviceQuery<N extends Table> implements PromiseLike<Result<N>> {
  private mode: "read" | "insert" | "update" | "delete" | "upsert" = "read";
  private payload: Values = {};
  private filters: ((row: Values) => boolean)[] = [];
  private sorts: { key: string; ascending: boolean }[] = [];
  private offset = 0;
  private count = Infinity;
  private conflict = "id";
  private original: { path: string; blob: Blob } | undefined;

  constructor(private table: N) {}
  select(_columns = "*") { return this; }
  order(key: string, options: { ascending: boolean }) { this.sorts.push({ key, ascending: options.ascending }); return this; }
  limit(count: number) { this.count = count; return this; }
  range(start: number, end: number) { this.offset = start; this.count = end - start + 1; return this; }
  eq(key: string, value: unknown) { this.filters.push(row => row[key] === value); return this; }
  gte(key: string, value: string) { this.filters.push(row => String(row[key]) >= value); return this; }
  lt(key: string, value: string) { this.filters.push(row => String(row[key]) < value); return this; }
  insert(value: Tables[N]["Insert"]) { this.mode = "insert"; this.payload = value as Values; return this; }
  update(value: Tables[N]["Update"]) { this.mode = "update"; this.payload = value as Values; return this; }
  delete() { this.mode = "delete"; return this; }
  upsert(value: Tables[N]["Insert"], options: { onConflict: string }) { this.mode = "upsert"; this.payload = value as Values; this.conflict = options.onConflict; return this; }
  withOriginal(path: string, blob: Blob) { this.original = { path, blob }; return this; }

  private async execute(): Promise<Result<N>> {
    try {
      const db = await database();
      const tx = db.transaction(["records", "originals"], this.mode === "read" ? "readonly" : "readwrite");
      const store = tx.objectStore("records");
      const stored = await store.index("table").getAll(this.table);
      let rows = stored.map(item => item.value);
      if (this.mode !== "read") {
        if (this.table === "activity_logs") throw new Error("Activity history is read-only.");
        const matches = this.mode === "upsert"
          ? rows.filter(row => this.conflict.split(",").every(key => row[key] === (this.payload[key] ?? (key === "user_id" ? DEVICE_ID : undefined))))
          : rows.filter(row => this.filters.every(filter => filter(row)));
        const targets = this.mode === "insert" || (this.mode === "upsert" && !matches.length) ? [undefined] : matches;
        const changed: Values[] = [];
        for (const previous of targets) {
          const now = new Date().toISOString();
          const row: Values = { ...defaults(this.table), id: crypto.randomUUID(), user_id: DEVICE_ID, created_at: now, updated_at: now, ...previous, ...this.payload };
          if (this.mode === "delete" && previous) {
            await store.delete(`${this.table}/${String(previous['id'])}`);
            if (this.table === "user_files") await tx.objectStore("originals").delete(String(previous['storage_path']));
            const dependents = this.table === "lunaria_tasks" ? "task_progress_logs" : this.table === "garden_habits" ? "habit_checkins" : null;
            if (dependents) {
              const key = dependents === "habit_checkins" ? "habit_id" : "task_id";
              for (const child of await store.index("table").getAll(dependents)) {
                if (child.value[key] === previous['id']) await store.delete(child.key);
              }
            }
            if (this.table === "collections") {
              for (const child of await store.index("table").getAll("user_files")) {
                if (child.value['collection_id'] === previous['id']) await store.put({ ...child, value: { ...child.value, collection_id: null } });
              }
            }
          } else {
            if (this.table === "habit_checkins" && !previous && rows.some(r => r['habit_id'] === row['habit_id'] && r['day'] === row['day'])) throw new Error("This habit is already completed for that date.");
            await store.put({ key: `${this.table}/${String(row['id'])}`, table: this.table, value: row });
            if (this.original) await tx.objectStore("originals").put(this.original.blob, this.original.path);
          }
          const event = activity(this.table, row, previous, this.mode === "delete");
          if (event) await store.put({ key: `activity_logs/${event.id}`, table: "activity_logs", value: event });
          changed.push(row);
        }
        await tx.done;
        if (typeof window !== "undefined") window.dispatchEvent(new Event("lunaria:device-saved"));
        rows = changed;
      } else {
        rows = rows.filter(row => this.filters.every(filter => filter(row)));
        await tx.done;
      }
      rows.sort((a, b) => {
        for (const sort of this.sorts) {
          const compared = String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? ""));
          if (compared) return sort.ascending ? compared : -compared;
        }
        return 0;
      });
      return { data: rows.slice(this.offset, this.offset + this.count) as unknown as Tables[N]["Row"][], error: null };
    } catch (error) {
      return { data: [], error: { message: error instanceof Error ? error.message : "Device storage is unavailable." } };
    }
  }
  async maybeSingle() { const result = await this.execute(); return { ...result, data: result.data[0] ?? null }; }
  single() { return this.maybeSingle(); }
  then<TResult1 = Result<N>, TResult2 = never>(onfulfilled?: ((value: Result<N>) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const deviceStore = { from: <N extends Table>(table: N) => new DeviceQuery(table) };
const urls = new Map<string, string>();
export async function originalUrl(path: string) {
  const cached = urls.get(path);
  if (cached) return cached;
  const blob = await (await database()).get("originals", path);
  if (!blob) throw new Error("The original file is not available on this device.");
  const url = URL.createObjectURL(blob);
  urls.set(path, url);
  return url;
}
export function releaseOriginal(path: string) {
  const url = urls.get(path);
  if (url) URL.revokeObjectURL(url);
  urls.delete(path);
}