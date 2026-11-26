import { DatePicker } from "./date-picker";
import { fieldCls } from "./bits";
import type { MemoryMetadata } from "@/lib/files";
import { todayISO } from "@/lib/data";
export const blankMemory = (): MemoryMetadata => ({
  memory_title: "",
  memory_date: todayISO(),
  caption: "",
  memory_location: "",
  memory_category: "",
  memory_tags: [],
});
export function MemoryFields({
  value,
  onChange,
}: {
  value: MemoryMetadata;
  onChange: (value: MemoryMetadata) => void;
}) {
  const set = (patch: Partial<MemoryMetadata>) => onChange({ ...value, ...patch });
  return (
    <div className="space-y-3">
      <label className="block text-sm">
        Memory title
        <input
          aria-label="Memory title"
          className={`${fieldCls} mt-1`}
          value={value.memory_title}
          onChange={(e) => set({ memory_title: e.target.value })}
          maxLength={200}
          placeholder="A moment to remember"
        />
      </label>
      <div>
        <label className="mb-1 block text-sm">Memory date</label>
        <DatePicker
          label="Memory date"
          value={value.memory_date ?? ""}
          onChange={(d) => set({ memory_date: d })}
        />
      </div>
      <label className="block text-sm">
        Personal notes
        <textarea
          aria-label="Personal notes"
          className={`${fieldCls} mt-1`}
          rows={3}
          value={value.caption}
          onChange={(e) => set({ caption: e.target.value })}
          maxLength={5000}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          Location
          <input
            aria-label="Memory location"
            className={`${fieldCls} mt-1`}
            value={value.memory_location}
            onChange={(e) => set({ memory_location: e.target.value })}
            maxLength={200}
          />
        </label>
        <label className="block text-sm">
          Category
          <input
            aria-label="Memory category"
            className={`${fieldCls} mt-1`}
            value={value.memory_category}
            onChange={(e) => set({ memory_category: e.target.value })}
            maxLength={80}
            placeholder="Travel, family…"
          />
        </label>
      </div>
      <label className="block text-sm">
        Tags
        <input
          aria-label="Memory tags"
          className={`${fieldCls} mt-1`}
          value={value.memory_tags.join(",")}
          onChange={(e) =>
            set({
              memory_tags: e.target.value
                .split(",")
                .slice(0, 20)
                .map((t) => t.slice(0, 80)),
            })
          }
          placeholder="summer, friends"
        />
      </label>
    </div>
  );
}
