'use client';

import { useState } from 'react';
import {
  CalendarDays,
  ChevronRight,
  Home,
  MessageCircle,
  MessagesSquare,
  Pencil,
  Sparkles,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link, usePathname } from '@/core/i18n/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import { Button } from '@/shared/components/ui/button';
import type { Customer } from '@/shared/lib/pitchforge';
import { cn } from '@/shared/lib/utils';

import { CustomerDialog } from './customer-dialog';
import { formatCustomerDate, StageBadge } from './ui';

export function CustomerProfileHeader({ customer }: { customer: Customer }) {
  const t = useTranslations('pitchforge');
  const locale = useLocale();
  const pathname = usePathname();
  const [editing, setEditing] = useState(false);
  const base = `/customers/${customer.id}`;
  const tabs = [
    { label: t('profile.overview'), href: base, exact: true, icon: Home },
    {
      label: t('profile.generate'),
      href: `${base}/script`,
      icon: Sparkles,
    },
    {
      label: t('profile.records'),
      href: `${base}/records`,
      icon: MessagesSquare,
    },
  ];

  return (
    <>
      <div className="mb-8">
        <Breadcrumb className="mb-7">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/customers">{t('profile.breadcrumb')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{customer.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-primary/10 text-primary flex size-20 shrink-0 items-center justify-center rounded-full text-2xl font-semibold">
              {customer.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-[-0.035em]">
                  {customer.name}
                </h1>
                <span className="text-muted-foreground text-sm">
                  {customer.vehicle_model || t('common.unknown')}
                </span>
                <StageBadge stage={customer.stage}>
                  {t(`stages.${customer.stage}`)}
                </StageBadge>
              </div>
              <div className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="size-3.5" />
                  {t(`channels.${customer.current_channel}`)}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  {t('customers.createdAt')}{' '}
                  {formatCustomerDate(customer.created_at, locale)}
                </span>
                {customer.last_contacted_at && (
                  <span>
                    {t('customers.lastContact')}{' '}
                    {formatCustomerDate(customer.last_contacted_at, locale)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="size-4" />
            {t('common.edit')}
          </Button>
        </div>
      </div>

      <div className="border-border mb-8 flex gap-8 border-b">
        {tabs.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors',
                active
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="size-4" />
              {tab.label}
              {active && (
                <span className="bg-primary absolute inset-x-0 -bottom-px h-0.5" />
              )}
            </Link>
          );
        })}
      </div>

      <CustomerDialog
        open={editing}
        onOpenChange={setEditing}
        customer={customer}
      />
    </>
  );
}
