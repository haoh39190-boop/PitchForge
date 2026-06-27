'use client';

import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Gauge,
  MessageSquareText,
  Sparkles,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { usePitchForge } from '@/shared/contexts/pitchforge';
import {
  COMMUNICATION_CHANNELS,
  CUSTOMER_STAGES,
  type CommunicationChannel,
  type CustomerStage,
} from '@/shared/lib/pitchforge';

import { CustomerProfileHeader } from './customer-profile-header';
import {
  DetailRow,
  formatRecordDate,
  StageBadge,
  WorkspaceCard,
  WorkspaceCardContent,
  WorkspaceCardHeader,
} from './ui';

export function CustomerOverview({ customerId }: { customerId: string }) {
  const t = useTranslations('pitchforge');
  const locale = useLocale();
  const { hydrated, customers, records, updateCustomer } = usePitchForge();
  const customer = customers.find((item) => item.id === customerId);
  const customerRecords = records
    .filter((record) => record.customer_id === customerId)
    .slice(0, 3);

  if (!hydrated)
    return <div className="bg-muted h-[640px] animate-pulse rounded-xl" />;
  if (!customer) return <CustomerNotFound />;

  const base = `/customers/${customer.id}`;

  return (
    <>
      <CustomerProfileHeader customer={customer} />

      <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-8">
        <div className="space-y-6">
          <WorkspaceCard>
            <WorkspaceCardHeader
              title={
                <span className="flex items-center gap-2">
                  <BookmarkCheck className="size-4" />
                  {t('profile.customerInfo')}
                </span>
              }
              description={t('profile.customerInfoDescription')}
            />
            <WorkspaceCardContent className="py-0">
              <DetailRow
                label={t('customers.budget')}
                value={customer.budget || t('common.notSet')}
              />
              <DetailRow
                label={t('profile.focus')}
                value={customer.focus || t('common.notSet')}
              />
              <DetailRow
                label={t('profile.objection')}
                value={customer.objection || t('common.notSet')}
                tone={customer.objection ? 'attention' : 'default'}
              />
              <DetailRow
                label={t('profile.remark')}
                value={customer.remark || t('common.notSet')}
              />
            </WorkspaceCardContent>
          </WorkspaceCard>

          <WorkspaceCard className="border-primary/20 bg-primary/[0.045] flex-row items-center justify-between px-6 py-5">
            <div className="flex items-start gap-4">
              <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h2 className="font-semibold">{t('profile.nextAction')}</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {t('profile.nextActionDescription')}
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href={`${base}/script`}>
                {t('profile.generateNow')}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </WorkspaceCard>

          <WorkspaceCard>
            <WorkspaceCardHeader
              title={
                <span className="flex items-center gap-2">
                  <MessageSquareText className="size-4" />
                  {t('profile.recentRecords')}
                </span>
              }
              description={t('records.count', {
                count: customerRecords.length,
              })}
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`${base}/records`}>{t('profile.viewAll')}</Link>
                </Button>
              }
            />

            {customerRecords.length > 0 ? (
              <div className="divide-border divide-y">
                {customerRecords.map((record) => (
                  <div key={record.id} className="flex gap-4 px-6 py-4">
                    <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
                      <MessageSquareText className="text-muted-foreground size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <StageBadge stage={record.stage}>
                          {t(`stages.${record.stage}`)}
                        </StageBadge>
                        <span className="text-muted-foreground text-xs">
                          {formatRecordDate(record.created_at, locale)}
                        </span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 text-sm leading-6">
                        {record.final_script}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="text-sm font-medium">{t('profile.noRecords')}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {t('profile.noRecordsDescription')}
                </p>
              </div>
            )}
          </WorkspaceCard>
        </div>

        <aside>
          <WorkspaceCard>
            <WorkspaceCardHeader
              title={
                <span className="flex items-center gap-2 text-sm">
                  <Gauge className="size-4" />
                  {t('profile.quickActions')}
                </span>
              }
              className="px-5 py-4"
            />
            <WorkspaceCardContent className="grid gap-4 px-5 py-4">
              <div className="grid gap-2">
                <Label className="text-xs">{t('customers.form.stage')}</Label>
                <Select
                  value={customer.stage}
                  onValueChange={(value) =>
                    updateCustomer(customer.id, {
                      stage: value as CustomerStage,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {t(`stages.${stage}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs">{t('customers.form.channel')}</Label>
                <Select
                  value={customer.current_channel}
                  onValueChange={(value) =>
                    updateCustomer(customer.id, {
                      current_channel: value as CommunicationChannel,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMUNICATION_CHANNELS.map((channel) => (
                      <SelectItem key={channel} value={channel}>
                        {t(`channels.${channel}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-border mt-1 grid gap-2 border-t pt-4">
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`${base}/script`}>
                    <MessageSquareText className="size-4" />
                    {t('profile.addRecord')}
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/saved-scripts">
                    <Bookmark className="size-4" />
                    {t('profile.viewScripts')}
                  </Link>
                </Button>
              </div>
            </WorkspaceCardContent>
          </WorkspaceCard>
        </aside>
      </div>
    </>
  );
}

export function CustomerNotFound() {
  const t = useTranslations('pitchforge');
  return (
    <WorkspaceCard className="flex min-h-[500px] flex-col items-center justify-center text-center">
      <h1 className="text-xl font-semibold">{t('profile.notFound')}</h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        {t('profile.notFoundDescription')}
      </p>
      <Button asChild className="mt-6">
        <Link href="/customers">{t('profile.backToCustomers')}</Link>
      </Button>
    </WorkspaceCard>
  );
}
