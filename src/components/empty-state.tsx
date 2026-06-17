import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-line bg-white px-8 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-mist text-cobalt">
        <Icon size={22} />
      </span>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-graphite">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
