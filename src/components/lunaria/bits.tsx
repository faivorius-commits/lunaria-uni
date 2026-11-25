import type { ReactNode, ElementType } from "react";

export function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <div className="text-4xl text-primary floaty">✿</div>
      <h3 className="text-xl">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{text}</p>
      {action}
    </div>
  );
}

export function PanelTitle({ icon: I, title, tone = "bg-petal", right }: { icon: ElementType; title: string; tone?: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className={`grid size-8 place-items-center rounded-xl ${tone}`}><I className="size-4 text-accent-foreground" /></span>
      <h3 className="text-lg">{title}</h3>
      {right && <div className="ml-auto">{right}</div>}
    </div>
  );
}

export const fieldCls = "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
