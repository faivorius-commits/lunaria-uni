import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  BookHeart,
  CheckCircle2,
  Flower2,
  ImageIcon,
  ChefHat,
  Folder,
  Sprout,
  Sun,
  CalendarDays,
  Compass,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DatePicker } from "./date-picker";
import { Empty, fieldCls } from "./bits";
import { activityDay, activityTime, newestFirst } from "@/lib/activity";
const icons: Record<string, typeof BookHeart> = {
  workspace: CheckCircle2,
  habits: Flower2,
  memories: ImageIcon,
  recipes: ChefHat,
  diary: BookHeart,
  collections: Folder,
  knowledge: Sprout,
  daily: Sun,
  calendar: CalendarDays,
  explore: Compass,
};
const links: Record<string, string> = {
  workspace: "/workspace",
  habits: "/garden",
  memories: "/memories",
  recipes: "/collections",
  diary: "/diary",
  collections: "/collections",
  knowledge: "/knowledge",
  daily: "/daily",
  calendar: "/calendar",
  explore: "/explore",
};
export function ActivityTimeline() {
  const [category, setCategory] = useState("");
  const [day, setDay] = useState("");
  const query = useInfiniteQuery({
    queryKey: ["activity_logs", category, day],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      let q = supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(pageParam, pageParam + 99);
      if (category) q = q.eq("activity_type", category);
      if (day) {
        const start = new Date(`${day}T00:00:00`);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        q = q.gte("created_at", start.toISOString()).lt("created_at", end.toISOString());
      }
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    getNextPageParam: (last, pages) => (last.length === 100 ? pages.length * 100 : undefined),
  });
  const rows = newestFirst(query.data?.pages.flat() ?? []);
  const days = [...new Set(rows.map((r) => activityDay(r.created_at)))];
  return (
    <section>
      <div className="mb-7 flex flex-wrap items-end gap-3">
        <label className="min-w-40 flex-1 text-sm">
          Category
          <select
            aria-label="Activity category"
            className={`${fieldCls} mt-1`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All activities</option>
            {Object.keys(icons).map((c) => (
              <option key={c} value={c}>
                {c[0]?.toUpperCase()}
                {c.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <div className="w-56 max-w-full">
          <label className="mb-1 block text-sm">Browse a day</label>
          <DatePicker value={day} onChange={setDay} label="Activity date" />
        </div>
        {day && (
          <Button variant="ghost" onClick={() => setDay("")}>
            All days
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          aria-label="Refresh activity"
          onClick={() => void query.refetch()}
        >
          <RefreshCw />
        </Button>
      </div>
      {query.isPending ? (
        <p className="py-8 text-muted-foreground">Gathering your chapters…</p>
      ) : query.isError ? (
        <p role="alert" className="text-destructive">
          Your activity couldn’t load. Please try refreshing.
        </p>
      ) : !rows.length ? (
        <Empty
          title="Your story is just beginning"
          text="Your next saved moment will appear here."
        />
      ) : (
        days.map((d) => (
          <div key={d} className="mb-8">
            <h2 className="mb-5 border-b pb-3 text-2xl">
              {new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h2>
            <ol className="activity-timeline">
              {rows
                .filter((r) => activityDay(r.created_at) === d)
                .map((r) => {
                  const Icon = icons[r.activity_type] ?? BookHeart;
                  return (
                    <li key={r.id} className="activity-line">
                      <time
                        dateTime={r.created_at}
                        className="pt-3 text-sm tabular-nums text-muted-foreground"
                        title={new Date(r.created_at).toLocaleString()}
                      >
                        {activityTime(r.created_at)}
                      </time>
                      <span className={`activity-icon tone-${r.activity_type}`}>
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 py-2">
                        <p className="font-semibold">{r.title}</p>
                        <p className="mt-1 break-words text-sm text-muted-foreground">
                          {r.description}
                        </p>
                        <Link
                          to={links[r.activity_type] ?? "/diary"}
                          className="mt-1 inline-block text-xs capitalize text-primary"
                        >
                          {r.activity_type} ↗
                        </Link>
                      </div>
                    </li>
                  );
                })}
            </ol>
          </div>
        ))
      )}
      {query.hasNextPage && (
        <Button
          variant="outline"
          disabled={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
        >
          {query.isFetchingNextPage ? "Loading…" : "Earlier activities"}
        </Button>
      )}
    </section>
  );
}
