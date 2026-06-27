'use client';

import { useMemo, useState } from 'react';
import { Bookmark, Copy, MoreHorizontal, Search, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Link, useRouter } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
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
import { usePitchForge } from '@/shared/contexts/pitchforge';
import type { SavedScript } from '@/shared/lib/pitchforge';

import { StageBadge, WorkspaceCard } from './ui';

export function SavedScriptsPage() {
  const t = useTranslations('pitchforge');
  const router = useRouter();
  const { hydrated, customers, savedScripts, deleteSavedScript } =
    usePitchForge();
  const [query, setQuery] = useState('');
  const [selectedScript, setSelectedScript] = useState<SavedScript | null>(
    null
  );
  const [selectedCustomer, setSelectedCustomer] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return savedScripts;
    return savedScripts.filter(
      (script) =>
        script.title.toLowerCase().includes(normalized) ||
        script.content.toLowerCase().includes(normalized)
    );
  }, [query, savedScripts]);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(t('common.copied'));
    } catch {
      toast.error(t('generator.copyFailed'));
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(t('saved.deleteConfirm'))) return;
    deleteSavedScript(id);
    toast.success(t('saved.deleted'));
  };

  const openCustomerPicker = (script: SavedScript) => {
    if (customers.length === 0) {
      toast.error(t('saved.noCustomer'));
      return;
    }
    setSelectedScript(script);
    setSelectedCustomer(customers[0].id);
  };

  const handleUse = () => {
    if (!selectedScript || !selectedCustomer) return;
    router.push(
      `/customers/${selectedCustomer}/script?savedScript=${selectedScript.id}`
    );
  };

  if (!hydrated) {
    return <div className="bg-muted h-[600px] animate-pulse rounded-xl" />;
  }

  return (
    <>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-primary mb-2 text-xs font-semibold tracking-[0.14em] uppercase">
            {t('saved.eyebrow')}
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.035em]">
            {t('saved.title')}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {t('saved.description')}
          </p>
        </div>
        <span className="text-muted-foreground text-sm">
          {t('saved.count', { count: filtered.length })}
        </span>
      </div>

      {savedScripts.length === 0 ? (
        <WorkspaceCard className="flex min-h-[470px] flex-col items-center justify-center text-center">
          <span className="bg-primary/10 text-primary mb-5 flex size-14 items-center justify-center rounded-full">
            <Bookmark className="size-6" />
          </span>
          <h2 className="text-xl font-semibold">{t('saved.emptyTitle')}</h2>
          <p className="text-muted-foreground mt-2 max-w-md text-sm">
            {t('saved.emptyDescription')}
          </p>
          <Button asChild className="mt-6">
            <Link href="/customers">{t('saved.goCustomers')}</Link>
          </Button>
        </WorkspaceCard>
      ) : (
        <>
          <div className="relative mb-5 w-80">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('saved.searchPlaceholder')}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            {filtered.map((script) => (
              <WorkspaceCard key={script.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">{script.title}</h2>
                    <div className="mt-2 flex items-center gap-2">
                      <StageBadge stage={script.stage}>
                        {t(`stages.${script.stage}`)}
                      </StageBadge>
                      <span className="text-muted-foreground text-xs">
                        {t(`channels.${script.channel}`)}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(script.id)}
                      >
                        <Trash2 className="size-4" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-muted-foreground mt-4 line-clamp-4 text-sm leading-6">
                  {script.content}
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(script.content)}
                  >
                    <Copy className="size-4" />
                    {t('common.copy')}
                  </Button>
                  <Button size="sm" onClick={() => openCustomerPicker(script)}>
                    {t('saved.useForCustomer')}
                  </Button>
                </div>
              </WorkspaceCard>
            ))}
          </div>
        </>
      )}

      <Dialog
        open={!!selectedScript}
        onOpenChange={(open) => {
          if (!open) setSelectedScript(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('saved.selectCustomerTitle')}</DialogTitle>
            <DialogDescription>
              {t('saved.selectCustomerDescription')}
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('saved.selectCustomer')} />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                  {customer.vehicle_model ? ` · ${customer.vehicle_model}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedScript(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleUse}>{t('common.use')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
