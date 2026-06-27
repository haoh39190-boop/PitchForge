'use client';

import { Copy, MessageSquareText, Sparkles, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import { usePitchForge } from '@/shared/contexts/pitchforge';

import { CustomerNotFound } from './customer-overview';
import { CustomerProfileHeader } from './customer-profile-header';
import { formatRecordDate, StageBadge, WorkspaceCard } from './ui';

export function RecordsPage({ customerId }: { customerId: string }) {
  const t = useTranslations('pitchforge');
  const locale = useLocale();
  const { hydrated, customers, records, deleteRecord } = usePitchForge();
  const customer = customers.find((item) => item.id === customerId);
  const customerRecords = records.filter(
    (record) => record.customer_id === customerId
  );

  if (!hydrated)
    return <div className="bg-muted h-[640px] animate-pulse rounded-xl" />;
  if (!customer) return <CustomerNotFound />;

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(t('common.copied'));
    } catch {
      toast.error(t('generator.copyFailed'));
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(t('records.deleteConfirm'))) return;
    deleteRecord(id);
    toast.success(t('records.deleted'));
  };

  return (
    <>
      <CustomerProfileHeader customer={customer} />
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t('records.title')}</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('records.description')}
          </p>
        </div>
        <span className="text-muted-foreground text-sm">
          {t('records.count', { count: customerRecords.length })}
        </span>
      </div>

      {customerRecords.length === 0 ? (
        <WorkspaceCard className="flex min-h-[430px] flex-col items-center justify-center text-center">
          <span className="bg-primary/10 text-primary mb-5 flex size-14 items-center justify-center rounded-full">
            <MessageSquareText className="size-6" />
          </span>
          <h3 className="text-lg font-semibold">{t('records.emptyTitle')}</h3>
          <p className="text-muted-foreground mt-2 max-w-md text-sm">
            {t('records.emptyDescription')}
          </p>
          <Button asChild className="mt-6">
            <Link href={`/customers/${customer.id}/script`}>
              <Sparkles className="size-4" />
              {t('records.generate')}
            </Link>
          </Button>
        </WorkspaceCard>
      ) : (
        <div className="grid gap-4">
          {customerRecords.map((record) => (
            <WorkspaceCard key={record.id}>
              <div className="border-border flex items-center justify-between border-b px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <StageBadge stage={record.stage}>
                    {t(`stages.${record.stage}`)}
                  </StageBadge>
                  <span className="text-muted-foreground text-xs">
                    {t(`channels.${record.channel}`)}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground text-xs">
                    {record.source_type === 'saved_script'
                      ? t('records.sourceSaved')
                      : t('records.sourceGenerated')}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {formatRecordDate(record.created_at, locale)}
                </span>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm leading-7 whitespace-pre-wrap">
                  {record.final_script}
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    {t('common.delete')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(record.final_script)}
                  >
                    <Copy className="size-4" />
                    {t('common.copy')}
                  </Button>
                </div>
              </div>
            </WorkspaceCard>
          ))}
        </div>
      )}
    </>
  );
}
