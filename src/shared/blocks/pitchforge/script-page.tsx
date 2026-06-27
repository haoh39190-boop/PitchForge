'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookmarkPlus,
  Copy,
  LoaderCircle,
  RefreshCw,
  Save,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { usePitchForge } from '@/shared/contexts/pitchforge';
import {
  COMMUNICATION_CHANNELS,
  CUSTOMER_STAGES,
  requestSalesScript,
  SCRIPT_TONES,
  type CommunicationChannel,
  type CustomerStage,
  type ScriptSections,
  type ScriptTone,
  type SourceType,
} from '@/shared/lib/pitchforge';

import { CustomerNotFound } from './customer-overview';
import { CustomerProfileHeader } from './customer-profile-header';
import { WorkspaceCard } from './ui';

export function ScriptPage({
  customerId,
  savedScriptId,
}: {
  customerId: string;
  savedScriptId?: string;
}) {
  const t = useTranslations('pitchforge');
  const locale = useLocale();
  const {
    hydrated,
    customers,
    records,
    savedScripts,
    addRecord,
    addSavedScript,
  } = usePitchForge();
  const customer = customers.find((item) => item.id === customerId);
  const sourceSavedScript = savedScripts.find(
    (item) => item.id === savedScriptId
  );
  const [stage, setStage] = useState<CustomerStage>('new_lead');
  const [channel, setChannel] = useState<CommunicationChannel>('phone');
  const [focus, setFocus] = useState('');
  const [objection, setObjection] = useState('');
  const [tone, setTone] = useState<ScriptTone>('professional');
  const [extraContext, setExtraContext] = useState('');
  const [instruction, setInstruction] = useState('');
  const [result, setResult] = useState<ScriptSections | null>(null);
  const [sourceType, setSourceType] = useState<SourceType>('generated');
  const [variant, setVariant] = useState(0);
  const [edited, setEdited] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');

  useEffect(() => {
    if (!customer) return;
    setStage(customer.stage);
    setChannel(customer.current_channel);
    setFocus(customer.focus);
    setObjection(customer.objection);
  }, [customer?.id]);

  useEffect(() => {
    if (!customer || !sourceSavedScript) return;
    setStage(sourceSavedScript.stage);
    setChannel(sourceSavedScript.channel);
    setFocus(sourceSavedScript.focus);
    setObjection(sourceSavedScript.objection);
    setTone(sourceSavedScript.tone);
    setResult({
      opening: '',
      needsConfirmation: '',
      objectionHandling: '',
      nextStep: '',
      fullScript: sourceSavedScript.content,
      salesReminder: locale.startsWith('zh')
        ? '结合这位客户的最新情况继续调整，再复制使用。'
        : 'Adjust this version to the customer’s latest situation before copying.',
      providerType: 'template',
    });
    setSourceType('saved_script');
    setEdited(false);
    toast.success(t('generator.fromSaved'));
  }, [customer?.id, sourceSavedScript?.id]);

  const generationInput = useMemo(
    () =>
      customer
        ? {
            customer,
            stage,
            channel,
            focus,
            objection,
            tone,
            extra_context: extraContext,
            locale,
          }
        : null,
    [customer, stage, channel, focus, objection, tone, extraContext, locale]
  );

  const recordAlreadySaved = useMemo(
    () =>
      !!result?.fullScript &&
      records.some(
        (record) =>
          record.customer_id === customerId &&
          record.final_script.trim() === result.fullScript.trim()
      ),
    [customerId, records, result?.fullScript]
  );

  if (!hydrated) {
    return <div className="bg-muted h-[680px] animate-pulse rounded-xl" />;
  }
  if (!customer || !generationInput) return <CustomerNotFound />;

  const replaceAllowed = () =>
    !edited || window.confirm(t('generator.replaceConfirm'));

  const runGeneration = async (
    nextVariant: number,
    nextInstruction: string,
    successMessage: string
  ) => {
    if (!replaceAllowed() || generating) return false;

    setGenerating(true);
    try {
      const generated = await requestSalesScript({
        ...generationInput,
        variant: nextVariant,
        instruction: nextInstruction,
      });
      setResult(generated);
      setSourceType('generated');
      setEdited(false);
      toast.success(successMessage);
      return true;
    } catch {
      toast.error(t('generator.generateFailed'));
      return false;
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async (
    nextVariant = variant,
    nextInstruction = ''
  ) => {
    await runGeneration(nextVariant, nextInstruction, t('generator.generated'));
  };

  const handleRewrite = async () => {
    const nextVariant = variant + 1;
    const generated = await runGeneration(
      nextVariant,
      '',
      t('generator.rewritten')
    );
    if (generated) setVariant(nextVariant);
  };

  const handleInstruction = async () => {
    const nextVariant = variant + 1;
    const generated = await runGeneration(
      nextVariant,
      instruction,
      t('generator.rewritten')
    );
    if (generated) setVariant(nextVariant);
  };

  const handleCopy = async () => {
    if (!result?.fullScript) return;
    try {
      await navigator.clipboard.writeText(result.fullScript);
      toast.success(t('common.copied'));
    } catch {
      toast.error(t('generator.copyFailed'));
    }
  };

  const handleSaveRecord = () => {
    if (!result?.fullScript) return;
    const saved = addRecord({
      customer_id: customer.id,
      customer_name: customer.name,
      vehicle_model: customer.vehicle_model,
      budget: customer.budget,
      stage,
      channel,
      focus,
      objection,
      tone,
      extra_context: extraContext,
      final_script: result.fullScript,
      script_sections: {
        ...result,
        fullScript: result.fullScript,
      },
      source_type: sourceType,
    });
    toast.success(
      saved.created
        ? t('generator.recordSaved')
        : t('generator.duplicateRecord')
    );
  };

  const handleSave = () => {
    const title =
      saveTitle.trim() ||
      `${t(`stages.${stage}`)} · ${customer.vehicle_model || customer.name}`;
    if (!result?.fullScript) return;
    addSavedScript({
      title,
      content: result.fullScript,
      stage,
      channel,
      objection,
      focus,
      vehicle_model: customer.vehicle_model,
      tone,
      source_customer_id: customer.id,
      source_record_id: '',
    });
    setSaveTitle('');
    setSaveOpen(false);
    toast.success(t('generator.saved'));
  };

  return (
    <>
      <CustomerProfileHeader customer={customer} />

      <div className="mb-6">
        <h2 className="text-xl font-semibold">{t('generator.title')}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {t('generator.description')}
        </p>
      </div>

      <div className="grid grid-cols-[370px_minmax(0,1fr)] items-start gap-7">
        <WorkspaceCard className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
              <Sparkles className="size-4" />
            </span>
            <h3 className="font-semibold">{t('generator.contextTitle')}</h3>
          </div>

          <div className="grid gap-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('generator.stage')}>
                <Select
                  value={stage}
                  onValueChange={(value) => setStage(value as CustomerStage)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_STAGES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {t(`stages.${value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t('generator.channel')}>
                <Select
                  value={channel}
                  onValueChange={(value) =>
                    setChannel(value as CommunicationChannel)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMUNICATION_CHANNELS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {t(`channels.${value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label={t('generator.focus')}>
              <Input
                value={focus}
                onChange={(event) => setFocus(event.target.value)}
                placeholder={t('generator.focusPlaceholder')}
              />
            </Field>
            <Field label={t('generator.objection')}>
              <Input
                value={objection}
                onChange={(event) => setObjection(event.target.value)}
                placeholder={t('generator.objectionPlaceholder')}
              />
            </Field>
            <Field label={t('generator.tone')}>
              <Select
                value={tone}
                onValueChange={(value) => setTone(value as ScriptTone)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCRIPT_TONES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`tones.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t('generator.extra')}>
              <Textarea
                value={extraContext}
                onChange={(event) => setExtraContext(event.target.value)}
                placeholder={t('generator.extraPlaceholder')}
                className="min-h-24 resize-none"
              />
            </Field>
            <Button
              className="w-full"
              onClick={() => handleGenerate()}
              disabled={generating}
            >
              {generating ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <WandSparkles className="size-4" />
              )}
              {generating
                ? t('generator.generating')
                : result
                  ? t('generator.regenerate')
                  : t('generator.generate')}
            </Button>
          </div>
        </WorkspaceCard>

        <WorkspaceCard className="min-h-[580px]">
          {result ? (
            <>
              <div className="border-border flex items-start justify-between gap-6 border-b px-6 py-5">
                <div>
                  <h3 className="font-semibold">
                    {t('generator.resultTitle')}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {t('generator.resultDescription')}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRewrite}
                    disabled={generating}
                  >
                    {generating ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <RefreshCw className="size-4" />
                    )}
                    {t('generator.rewrite')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="size-4" />
                    {t('common.copy')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveRecord}
                    disabled={recordAlreadySaved}
                  >
                    <Save className="size-4" />
                    {recordAlreadySaved
                      ? t('generator.recordAlreadySaved')
                      : t('generator.saveRecord')}
                  </Button>
                </div>
              </div>

              <div className="p-6">
                {result.opening && (
                  <div className="mb-5 grid grid-cols-2 gap-3">
                    <ScriptPart
                      label={t('generator.opening')}
                      value={result.opening}
                    />
                    <ScriptPart
                      label={t('generator.needs')}
                      value={result.needsConfirmation}
                    />
                    <ScriptPart
                      label={t('generator.objectionHandling')}
                      value={result.objectionHandling}
                    />
                    <ScriptPart
                      label={t('generator.nextStep')}
                      value={result.nextStep}
                    />
                  </div>
                )}

                <Field label={t('generator.fullScript')}>
                  <Textarea
                    value={result.fullScript}
                    onChange={(event) => {
                      setResult({
                        ...result,
                        fullScript: event.target.value,
                      });
                      setEdited(true);
                    }}
                    className="min-h-52 resize-y text-[15px] leading-7"
                  />
                </Field>

                <div className="bg-muted/60 mt-4 rounded-lg px-4 py-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    {t('generator.reminder')}
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {result.salesReminder}
                  </p>
                </div>

                <div className="mt-5 flex items-end gap-3">
                  <div className="grid flex-1 gap-2">
                    <Label>{t('generator.instruction')}</Label>
                    <Input
                      value={instruction}
                      onChange={(event) => setInstruction(event.target.value)}
                      placeholder={t('generator.instructionPlaceholder')}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleInstruction}
                    disabled={!instruction.trim() || generating}
                  >
                    {t('generator.applyInstruction')}
                  </Button>
                  <Button variant="outline" onClick={() => setSaveOpen(true)}>
                    <BookmarkPlus className="size-4" />
                    {t('generator.saveScript')}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[580px] flex-col items-center justify-center px-8 text-center">
              <span className="bg-primary/10 text-primary mb-5 flex size-14 items-center justify-center rounded-full">
                <WandSparkles className="size-6" />
              </span>
              <h3 className="text-lg font-semibold">
                {t('generator.waitingTitle')}
              </h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
                {t('generator.waitingDescription')}
              </p>
            </div>
          )}
        </WorkspaceCard>
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('generator.saveTitle')}</DialogTitle>
            <DialogDescription>
              {t('generator.saveDescription')}
            </DialogDescription>
          </DialogHeader>
          <Field label={t('generator.titleLabel')}>
            <Input
              value={saveTitle}
              onChange={(event) => setSaveTitle(event.target.value)}
              placeholder={t('generator.titlePlaceholder')}
              autoFocus
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ScriptPart({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-muted/25 rounded-lg border p-3.5">
      <p className="text-primary text-xs font-semibold">{label}</p>
      <p className="text-muted-foreground mt-1.5 line-clamp-3 text-xs leading-5">
        {value}
      </p>
    </div>
  );
}
