'use client';

import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import type { CustomerStage } from '@/shared/lib/pitchforge';
import { cn } from '@/shared/lib/utils';

const stageStyles: Record<CustomerStage, string> = {
  new_lead: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  following_up: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  visit_scheduled:
    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  negotiating:
    'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  won: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  paused: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
};

export function StageBadge({
  stage,
  children,
  className,
}: {
  stage: CustomerStage;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'rounded-full border-0 px-2.5 py-1 font-medium shadow-none',
        stageStyles[stage],
        className
      )}
    >
      {children}
    </Badge>
  );
}

export function WorkspaceCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn('gap-0 overflow-hidden py-0 shadow-none', className)}
      {...props}
    />
  );
}

export function WorkspaceCardHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <CardHeader
      className={cn(
        'border-border border-b px-6 py-5',
        action && 'grid-cols-[1fr_auto]',
        className
      )}
    >
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
      {action && (
        <div className="col-start-2 row-span-2 row-start-1 self-start">
          {action}
        </div>
      )}
    </CardHeader>
  );
}

export function WorkspaceCardContent({
  className,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  return <CardContent className={cn('px-6 py-5', className)} {...props} />;
}

export function DetailRow({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'attention';
}) {
  return (
    <div className="border-border/70 grid grid-cols-[140px_1fr] gap-5 border-b py-4 last:border-b-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span
        className={cn(
          'text-sm leading-6',
          tone === 'attention' && 'text-rose-700 dark:text-rose-300'
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function formatCustomerDate(value: string, locale: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function formatRecordDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
