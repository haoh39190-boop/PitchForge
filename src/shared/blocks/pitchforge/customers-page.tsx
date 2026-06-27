'use client';

import { useMemo, useState } from 'react';
import { MoreHorizontal, Plus, Search, Trash2, UsersRound } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useRouter } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { usePitchForge } from '@/shared/contexts/pitchforge';
import { CUSTOMER_STAGES, type CustomerStage } from '@/shared/lib/pitchforge';

import { CustomerDialog } from './customer-dialog';
import { formatCustomerDate, StageBadge, WorkspaceCard } from './ui';

export function CustomersPage() {
  const t = useTranslations('pitchforge');
  const locale = useLocale();
  const router = useRouter();
  const { hydrated, customers, addSampleCustomer, deleteCustomer } =
    usePitchForge();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<CustomerStage | 'all'>('all');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesQuery =
        !normalized ||
        customer.name.toLowerCase().includes(normalized) ||
        customer.vehicle_model.toLowerCase().includes(normalized);
      const matchesStage = stage === 'all' || customer.stage === stage;
      return matchesQuery && matchesStage;
    });
  }, [customers, query, stage]);

  const handleSample = () => {
    const customer = addSampleCustomer(locale);
    router.push(`/customers/${customer.id}`);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(t('customers.deleteConfirm'))) return;
    deleteCustomer(id);
    toast.success(t('customers.deleted'));
  };

  if (!hydrated) {
    return <CustomersSkeleton />;
  }

  return (
    <>
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="text-primary mb-2 text-xs font-semibold tracking-[0.14em] uppercase">
            {t('customers.eyebrow')}
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.035em]">
            {t('customers.title')}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {t('customers.description')}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          {t('customers.newCustomer')}
        </Button>
      </div>

      {customers.length === 0 ? (
        <WorkspaceCard className="flex min-h-[470px] flex-col items-center justify-center px-6 text-center">
          <span className="bg-primary/10 text-primary mb-5 flex size-14 items-center justify-center rounded-full">
            <UsersRound className="size-6" />
          </span>
          <h2 className="text-xl font-semibold">{t('customers.emptyTitle')}</h2>
          <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
            {t('customers.emptyDescription')}
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" />
              {t('customers.newCustomer')}
            </Button>
            <Button variant="outline" onClick={handleSample}>
              {t('customers.addSample')}
            </Button>
          </div>
        </WorkspaceCard>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-80">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('customers.searchPlaceholder')}
                  className="pl-9"
                />
              </div>
              <Select
                value={stage}
                onValueChange={(value) =>
                  setStage(value as CustomerStage | 'all')
                }
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder={t('customers.stageFilter')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {CUSTOMER_STAGES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`stages.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-muted-foreground text-sm">
              {t('customers.customerCount', { count: filtered.length })}
            </span>
          </div>

          <WorkspaceCard>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[34%] px-6">
                    {t('customers.title')}
                  </TableHead>
                  <TableHead>{t('customers.vehicle')}</TableHead>
                  <TableHead>{t('customers.budget')}</TableHead>
                  <TableHead>{t('customers.lastContact')}</TableHead>
                  <TableHead className="w-14" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((customer) => (
                  <TableRow
                    key={customer.id}
                    tabIndex={0}
                    onClick={() => router.push(`/customers/${customer.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        router.push(`/customers/${customer.id}`);
                      }
                    }}
                    className="h-[76px] cursor-pointer"
                  >
                    <TableCell className="px-6">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                          {customer.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {customer.name}
                          </p>
                          <StageBadge stage={customer.stage} className="mt-1">
                            {t(`stages.${customer.stage}`)}
                          </StageBadge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.vehicle_model || t('common.unknown')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.budget || t('common.unknown')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.last_contacted_at
                        ? formatCustomerDate(customer.last_contacted_at, locale)
                        : t('customers.noContact')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(customer.id);
                            }}
                          >
                            <Trash2 className="size-4" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && (
              <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
                {t('customers.searchPlaceholder')}
              </div>
            )}
          </WorkspaceCard>
        </>
      )}

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(customer) => router.push(`/customers/${customer.id}`)}
      />
    </>
  );
}

function CustomersSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-muted h-9 w-40 rounded-md" />
      <div className="bg-muted mt-3 h-4 w-96 rounded-md" />
      <div className="bg-muted mt-10 h-[470px] rounded-xl" />
    </div>
  );
}
