-- LUNARIA TASK SYSTEM
-- Small Tasks, Long Tasks, daily progress and archives

ALTER TABLE public.lunaria_tasks
  ADD COLUMN IF NOT EXISTS task_type text NOT NULL DEFAULT 'small',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS progress integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Keep old completed tasks compatible
UPDATE public.lunaria_tasks
SET status = 'completed',
    progress = 100
WHERE done = true;

ALTER TABLE public.lunaria_tasks
  ADD CONSTRAINT lunaria_tasks_type_check
  CHECK (task_type IN ('small', 'long'));

ALTER TABLE public.lunaria_tasks
  ADD CONSTRAINT lunaria_tasks_status_check
  CHECK (status IN ('active', 'completed', 'failed'));

ALTER TABLE public.lunaria_tasks
  ADD CONSTRAINT lunaria_tasks_progress_check
  CHECK (progress BETWEEN 0 AND 100);

CREATE INDEX IF NOT EXISTS lunaria_tasks_status_due_idx
ON public.lunaria_tasks(user_id, status, due_date);

-- Daily progress history for Long Tasks
CREATE TABLE IF NOT EXISTS public.task_progress_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.lunaria_tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  log_date date NOT NULL DEFAULT current_date,
  progress_note text NOT NULL,
  progress_percent integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT task_progress_percent_check
    CHECK (progress_percent BETWEEN 0 AND 100),

  CONSTRAINT task_progress_note_check
    CHECK (char_length(progress_note) BETWEEN 1 AND 3000),

  CONSTRAINT task_progress_daily_unique
    UNIQUE (task_id, log_date)
);

CREATE INDEX IF NOT EXISTS task_progress_logs_task_date_idx
ON public.task_progress_logs(task_id, log_date DESC);

ALTER TABLE public.task_progress_logs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.task_progress_logs TO authenticated;

CREATE POLICY "Users manage own task progress"
ON public.task_progress_logs
FOR ALL
TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1
    FROM public.lunaria_tasks t
    WHERE t.id = task_id
      AND t.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND EXISTS (
    SELECT 1
    FROM public.lunaria_tasks t
    WHERE t.id = task_id
      AND t.user_id = (SELECT auth.uid())
  )
);
