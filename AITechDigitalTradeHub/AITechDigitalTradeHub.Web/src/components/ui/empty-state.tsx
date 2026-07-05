import { Inbox } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="dashboard-card animate-panel-in p-6 text-center md:p-10">
      <span className="mx-auto grid size-14 place-items-center rounded-lg bg-primary/10 text-primary">
        <Inbox className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-black">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted">{description}</p>
      <div className="mx-auto mt-6 h-2 max-w-sm overflow-hidden rounded-full bg-background">
        <div className="animated-rail h-full w-2/3 rounded-full" />
      </div>
    </div>
  );
}
