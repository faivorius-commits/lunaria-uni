
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Archive, CalendarDays, Check, CheckCircle2, Clock3,
  ListTodo, Plus, Sparkles, Trash2, XCircle, History,
  Target, TrendingUp, Tag, UserRound, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/lunaria/app-shell";
import { Empty, PanelTitle, fieldCls } from "@/components/lunaria/bits";
import { FileGallery } from "@/components/lunaria/file-gallery";
import { supabase } from "@/integrations/supabase/client";
import { useRows } from "@/lib/data";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/workspace")({
  head: pageHead("Workspace", "Your tasks, projects, and progress."),
  component: Workspace,
});

type TaskType = "small" | "long";
type TaskStatus = "active" | "completed" | "failed";

type Task = {
  id: string;
  title: string;
  description?: string;
  due_date: string | null;
  done: boolean;
  task_type: TaskType;
  status: TaskStatus;
  progress: number;
  created_at: string;
  labels: string[];
  assigned_by: string;
};

type ProgressLog = {
  id: string;
  task_id: string;
  log_date: string;
  progress_note: string;
  progress_percent: number;
  created_at: string;
};

const LABEL_PRESETS = [
  "School",
  "Organization",
  "Personal",
  "Project",
  "Competition",
  "Other",
];

const todayISO = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const formatDate = (date?: string | null) =>
  date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No deadline";

function Workspace() {
  const taskQuery = useRows("lunaria_tasks");
  const tasks = (taskQuery.data ?? []) as unknown as Task[];

  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [show, setShow] = useState<TaskStatus>("active");
  const [type, setType] = useState<TaskType>("small");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState("");
  const [assignedBy, setAssignedBy] = useState("");

  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [customLabel, setCustomLabel] = useState("");
  const [labelFilter, setLabelFilter] = useState("all");

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [progressNote, setProgressNote] = useState("");
  const [progressValue, setProgressValue] = useState("10");
  const [saving, setSaving] = useState(false);

  async function refreshTasks() {
    await taskQuery.refetch();
  }

  async function refreshLogs() {
    const { data, error } = await supabase
      .from("task_progress_logs")
      .select("*")
      .order("log_date", { ascending: false });

    if (!error) setLogs((data ?? []) as ProgressLog[]);
  }

  // Automatically archive unfinished tasks after their deadline.
  useEffect(() => {
    let cancelled = false;

    async function expireTasks() {
      const today = todayISO();

      const expired = tasks.filter(
        (task) =>
          task.status === "active" &&
          !task.done &&
          task.due_date &&
          task.due_date < today
      );

      for (const task of expired) {
        if (cancelled) return;

        await supabase
          .from("lunaria_tasks")
          .update({ status: "failed" } as any)
          .eq("id", task.id)
          .eq("status", "active");
      }

      if (expired.length > 0 && !cancelled) {
        await refreshTasks();
      }
    }

    expireTasks();

    return () => {
      cancelled = true;
    };
  }, [
    tasks
      .map((task) => `${task.id}:${task.status}:${task.due_date}`)
      .join("|"),
  ]);

  useEffect(() => {
    refreshLogs();
  }, []);

  const availableLabels = useMemo(() => {
    const labels = tasks.flatMap((task) => task.labels ?? []);
    return [...new Set([...LABEL_PRESETS, ...labels])].sort();
  }, [tasks]);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const status = task.status ?? (task.done ? "completed" : "active");
        const matchesStatus = status === show;
        const matchesLabel =
          labelFilter === "all" ||
          (task.labels ?? []).includes(labelFilter);

        return matchesStatus && matchesLabel;
      }),
    [tasks, show, labelFilter]
  );

  const activeCount = tasks.filter(
    (task) => task.status === "active"
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === "completed" || task.done
  ).length;

  const failedCount = tasks.filter(
    (task) => task.status === "failed"
  ).length;

  function toggleLabel(label: string) {
    setSelectedLabels((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label]
    );
  }

  function addCustomLabel() {
    const label = customLabel.trim();

    if (!label) return;

    if (
      !selectedLabels.some(
        (item) => item.toLowerCase() === label.toLowerCase()
      )
    ) {
      setSelectedLabels((current) => [...current, label]);
    }

    setCustomLabel("");
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !due) return;

    setSaving(true);

    const { error } = await supabase.from("lunaria_tasks").insert({
      title: title.trim(),
      description: description.trim(),
      due_date: due,
      task_type: type,
      status: "active",
      progress: 0,
      done: false,
      labels: selectedLabels,
      assigned_by: assignedBy.trim(),
    } as any);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTitle("");
    setDescription("");
    setDue("");
    setAssignedBy("");
    setSelectedLabels([]);
    setCustomLabel("");

    await refreshTasks();
  }

  async function completeTask(task: Task) {
    const confirmed = confirm(
      `Mark "${task.title}" as completed?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("lunaria_tasks")
      .update({
        done: true,
        status: "completed",
        progress: 100,
        completed_at: new Date().toISOString(),
      } as any)
      .eq("id", task.id);

    if (error) {
      alert(error.message);
      return;
    }

    await refreshTasks();
  }

  async function saveDailyProgress(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedTask || !progressNote.trim()) return;

    const newProgress = Math.min(
      99,
      Math.max(0, Number(progressValue) || 0)
    );

    setSaving(true);

    const today = todayISO();

    const { error: logError } = await supabase
      .from("task_progress_logs")
      .upsert(
        {
          task_id: selectedTask.id,
          log_date: today,
          progress_note: progressNote.trim(),
          progress_percent: newProgress,
        },
        { onConflict: "task_id,log_date" }
      );

    if (logError) {
      setSaving(false);
      alert(logError.message);
      return;
    }

    const { error: taskError } = await supabase
      .from("lunaria_tasks")
      .update({ progress: newProgress } as any)
      .eq("id", selectedTask.id);

    setSaving(false);

    if (taskError) {
      alert(taskError.message);
      return;
    }

    setProgressNote("");
    setSelectedTask(null);

    await Promise.all([refreshTasks(), refreshLogs()]);
  }

  async function deleteTask(task: Task) {
    if (!confirm(`Delete "${task.title}" permanently?`)) return;

    const { error } = await supabase
      .from("lunaria_tasks")
      .delete()
      .eq("id", task.id);

    if (error) {
      alert(error.message);
      return;
    }

    await Promise.all([refreshTasks(), refreshLogs()]);
  }

  function taskLogs(taskId: string) {
    return logs.filter((log) => log.task_id === taskId);
  }

  return (
    <>
      <Hero
        title="Workspace"
        blurb="Little steps, big dreams. Organize your journey."
      />

      {/* TASK STATISTICS */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="panel p-4">
          <ListTodo className="mb-2 size-5 text-primary" />
          <p className="text-2xl font-semibold">{activeCount}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>

        <div className="panel p-4">
          <CheckCircle2 className="mb-2 size-5 text-emerald-500" />
          <p className="text-2xl font-semibold">{completedCount}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>

        <div className="panel p-4">
          <Archive className="mb-2 size-5 text-rose-400" />
          <p className="text-2xl font-semibold">{failedCount}</p>
          <p className="text-xs text-muted-foreground">Failed</p>
        </div>
      </div>

      {/* CREATE TASK */}
      <section className="panel mb-6 p-5">
        <PanelTitle icon={Sparkles} title="Create a new task" />

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType("small")}
            className={`rounded-2xl border p-4 text-left transition ${
              type === "small"
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary/40"
            }`}
          >
            <Clock3 className="mb-2 size-5 text-amber-500" />
            <b>Small Task</b>
            <p className="mt-1 text-xs text-muted-foreground">
              Quick task, one-time completion
            </p>
          </button>

          <button
            type="button"
            onClick={() => setType("long")}
            className={`rounded-2xl border p-4 text-left transition ${
              type === "long"
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary/40"
            }`}
          >
            <Target className="mb-2 size-5 text-violet-500" />
            <b>Long Task</b>
            <p className="mt-1 text-xs text-muted-foreground">
              Multi-day project with daily progress
            </p>
          </button>
        </div>

        <form onSubmit={addTask} className="flex flex-col gap-3">
          <input
            className={fieldCls}
            placeholder="What do you want to accomplish?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={240}
            required
          />

          <textarea
            className={fieldCls}
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />

          {/* LABEL SELECTION */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Tag className="size-4" />
              Task labels
            </label>

            <div className="flex flex-wrap gap-2">
              {LABEL_PRESETS.map((label) => {
                const selected = selectedLabels.includes(label);

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleLabel(label)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      selected
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-secondary/50 text-muted-foreground"
                    }`}
                  >
                    {selected ? "✓ " : "+ "}
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                className={fieldCls}
                placeholder="Create a custom label..."
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomLabel();
                  }
                }}
              />

              <Button
                type="button"
                variant="outline"
                onClick={addCustomLabel}
                disabled={!customLabel.trim()}
              >
                <Plus className="size-4" />
              </Button>
            </div>

            {selectedLabels.some(
              (label) => !LABEL_PRESETS.includes(label)
            ) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedLabels
                  .filter((label) => !LABEL_PRESETS.includes(label))
                  .map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleLabel(label)}
                      className="rounded-full bg-violet-500/10 px-3 py-1.5 text-xs text-violet-600"
                    >
                      {label} ×
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* ASSIGNED BY */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <UserRound className="size-4" />
              Assigned by
              <span className="text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </label>

            <input
              className={fieldCls}
              placeholder="Who gave you this task?"
              value={assignedBy}
              onChange={(e) => setAssignedBy(e.target.value)}
              maxLength={120}
            />
          </div>

          <label className="text-sm font-medium">Deadline</label>

          <input
            className={fieldCls}
            type="date"
            value={due}
            min={todayISO()}
            onChange={(e) => setDue(e.target.value)}
            required
          />

          <Button disabled={saving || !title.trim() || !due}>
            <Plus className="mr-1 size-4" />
            Create {type === "small" ? "Small Task" : "Long Task"}
          </Button>
        </form>
      </section>

      {/* TASK LIST */}
      <section className="panel mb-6 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <PanelTitle icon={ListTodo} title="Your task space" />

          <div className="flex gap-1">
            {(["active", "completed", "failed"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setShow(item)}
                className={`rounded-full px-3 py-1.5 text-xs capitalize ${
                  show === item
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* LABEL FILTER */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />

          <select
            className={`${fieldCls} max-w-xs`}
            value={labelFilter}
            onChange={(e) => setLabelFilter(e.target.value)}
          >
            <option value="all">All labels</option>
            {availableLabels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {taskQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading tasks...
          </p>
        ) : filteredTasks.length === 0 ? (
          <Empty
            title={
              show === "active"
                ? "A fresh page awaits"
                : show === "completed"
                  ? "No completed tasks yet"
                  : "No failed tasks"
            }
            text="Your task journey will appear here."
          />
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const history = taskLogs(task.id);
              const isLong = task.task_type === "long";

              return (
                <article
                  key={task.id}
                  className="rounded-2xl border border-border/70 bg-background/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${
                            isLong
                              ? "bg-violet-500/10 text-violet-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {isLong ? "✦ Long Task" : "✧ Small Task"}
                        </span>

                        {task.status === "completed" && (
                          <span className="text-xs text-emerald-600">
                            Completed
                          </span>
                        )}

                        {task.status === "failed" && (
                          <span className="text-xs text-rose-500">
                            Failed
                          </span>
                        )}
                      </div>

                      <h3 className="break-words font-semibold">
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}

                      {/* TASK LABELS */}
                      {(task.labels ?? []).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(task.labels ?? []).map((label) => (
                            <span
                              key={label}
                              className="rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-xs text-primary"
                            >
                              <Tag className="mr-1 inline size-3" />
                              {label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* ASSIGNED BY */}
                      {task.assigned_by && (
                        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <UserRound className="size-3.5" />
                          Assigned by: {task.assigned_by}
                        </p>
                      )}

                      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        Deadline: {formatDate(task.due_date)}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteTask(task)}
                      className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete task"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {/* LONG TASK PROGRESS */}
                  {isLong && (
                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <TrendingUp className="size-3.5" />
                          Overall progress
                        </span>
                        <b>{task.progress ?? 0}%</b>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-pink-400 transition-all"
                          style={{
                            width: `${task.progress ?? 0}%`,
                          }}
                        />
                      </div>

                      {task.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 rounded-full"
                          onClick={() => {
                            setSelectedTask(task);
                            setProgressValue(
                              String(task.progress ?? 0)
                            );
                          }}
                        >
                          <Plus className="mr-1 size-3.5" />
                          Add today's progress
                        </Button>
                      )}

                      <div className="mt-4">
                        <p className="mb-2 flex items-center gap-2 text-xs font-semibold">
                          <History className="size-3.5" />
                          Daily progress history
                        </p>

                        {history.length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            No progress entries yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {history.map((log) => (
                              <div
                                key={log.id}
                                className="rounded-xl bg-secondary/60 p-3"
                              >
                                <div className="mb-1 flex justify-between text-xs">
                                  <b>{formatDate(log.log_date)}</b>
                                  <span>{log.progress_percent}%</span>
                                </div>
                                <p className="text-sm">
                                  {log.progress_note}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* COMPLETE TASK */}
                  {task.status === "active" && (
                    <Button
                      size="sm"
                      className="mt-4 rounded-full"
                      onClick={() => completeTask(task)}
                    >
                      <Check className="mr-1 size-4" />
                      Mark as completed
                    </Button>
                  )}

                  {task.status === "failed" && (
                    <p className="mt-3 flex items-center gap-2 text-xs text-rose-500">
                      <XCircle className="size-4" />
                      Deadline passed before completion.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* DAILY PROGRESS FORM */}
      {selectedTask && (
        <div className="panel mb-6 p-5">
          <div className="mb-4 flex items-center justify-between">
            <PanelTitle
              icon={TrendingUp}
              title="Today's progress"
            />

            <button
              onClick={() => setSelectedTask(null)}
              aria-label="Close"
            >
              <XCircle className="size-5" />
            </button>
          </div>

          <p className="mb-3 text-sm text-muted-foreground">
            {selectedTask.title}
          </p>

          <form
            onSubmit={saveDailyProgress}
            className="space-y-3"
          >
            <label className="text-sm font-medium">
              What did you work on today?
            </label>

            <textarea
              className={fieldCls}
              rows={3}
              placeholder="Write a little update about today's work..."
              value={progressNote}
              onChange={(e) => setProgressNote(e.target.value)}
              required
            />

            <label className="text-sm font-medium">
              Overall progress (%)
            </label>

            <input
              className={fieldCls}
              type="number"
              min="0"
              max="99"
              value={progressValue}
              onChange={(e) => setProgressValue(e.target.value)}
              required
            />

            <p className="text-xs text-muted-foreground">
              You can save one progress entry per day. Saving again
              today updates that day's entry.
            </p>

            <Button disabled={saving || !progressNote.trim()}>
              Save daily progress
            </Button>
          </form>
        </div>
      )}

      <FileGallery
        filter={(f) => f.category === "Workspace"}
        category="Workspace"
        emptyTitle="No project files yet"
      />
    </>
  );
}
