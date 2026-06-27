'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  LoaderCircle,
  MessageSquareText,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  requestSalesScript,
  type CustomerStage,
} from '@/shared/lib/pitchforge';
import type { Section } from '@/shared/types/blocks/landing';

export function HeroPitchforge({ section }: { section: Section }) {
  const locale = useLocale();
  const copy = section as Section & {
    badge?: string;
    points?: string[];
    generator?: Record<string, string>;
  };
  const ui = copy.generator || {};
  const [name, setName] = useState(ui.sample_name || '');
  const [vehicle, setVehicle] = useState(ui.sample_vehicle || '');
  const [focus, setFocus] = useState(ui.sample_focus || '');
  const [stage, setStage] = useState<CustomerStage>('following_up');
  const [script, setScript] = useState(ui.initial_script || '');
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    const now = new Date().toISOString();
    setGenerating(true);
    try {
      const result = await requestSalesScript({
        customer: {
          id: 'hero',
          name,
          vehicle_model: vehicle,
          budget: ui.sample_budget || '',
          stage,
          current_channel: 'wechat',
          focus,
          objection: ui.sample_objection || '',
          remark: '',
          created_at: now,
          updated_at: now,
          last_contacted_at: '',
        },
        stage,
        channel: 'wechat',
        focus,
        objection: ui.sample_objection || '',
        tone: 'friendly',
        extra_context: '',
        locale,
        variant: Math.floor(Math.random() * 3),
      });
      setScript(result.fullScript);
    } catch {
      toast.error(
        locale.startsWith('zh')
          ? '生成失败，请稍后重试'
          : 'Generation failed. Please try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const copyScript = async () => {
    await navigator.clipboard.writeText(script);
    toast.success(ui.copied || 'Copied');
  };

  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="from-primary/[0.09] pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-gradient-to-b to-transparent" />
      <div className="mx-auto grid max-w-[1180px] grid-cols-[0.9fr_1.1fr] items-center gap-14 px-6">
        <div>
          {copy.badge && (
            <span className="border-primary/20 bg-primary/[0.07] text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold">
              <Sparkles className="size-3.5" />
              {copy.badge}
            </span>
          )}
          <h1 className="max-w-[34rem] text-[2.625rem] leading-[1.14] font-semibold tracking-[-0.045em] text-balance md:text-5xl">
            {copy.title}
          </h1>
          <p className="text-muted-foreground mt-6 max-w-lg text-lg leading-8">
            {copy.description}
          </p>

          <div className="mt-8 flex items-center gap-3">
            {copy.buttons?.map((button, index) => (
              <Button
                key={button.title}
                variant={button.variant === 'outline' ? 'outline' : 'default'}
                size="lg"
                asChild
              >
                <Link href={button.url || '/'}>
                  {button.title}
                  {index === 0 && <ArrowRight className="size-4" />}
                </Link>
              </Button>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
            {copy.points?.map((point) => (
              <span
                key={point}
                className="text-muted-foreground flex items-center gap-1.5 text-sm"
              >
                <Check className="text-primary size-4" />
                {point}
              </span>
            ))}
          </div>
        </div>

        <div className="border-border/80 bg-card rounded-2xl border p-2 shadow-[0_24px_70px_-35px_rgba(15,42,53,0.38)]">
          <div className="border-border/70 bg-background rounded-xl border">
            <div className="border-border/70 flex items-center justify-between border-b px-5 py-4">
              <div>
                <p className="font-semibold">{ui.title}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {ui.description}
                </p>
              </div>
              <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                <MessageSquareText className="size-4" />
              </span>
            </div>

            <div className="grid grid-cols-[220px_1fr]">
              <div className="border-border/70 grid content-start gap-4 border-r p-5">
                <HeroField label={ui.customer}>
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </HeroField>
                <HeroField label={ui.vehicle}>
                  <Input
                    value={vehicle}
                    onChange={(event) => setVehicle(event.target.value)}
                  />
                </HeroField>
                <HeroField label={ui.stage}>
                  <Select
                    value={stage}
                    onValueChange={(value) => setStage(value as CustomerStage)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_lead">{ui.stage_new}</SelectItem>
                      <SelectItem value="following_up">
                        {ui.stage_following}
                      </SelectItem>
                      <SelectItem value="visit_scheduled">
                        {ui.stage_visit}
                      </SelectItem>
                      <SelectItem value="negotiating">
                        {ui.stage_negotiating}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </HeroField>
                <HeroField label={ui.focus}>
                  <Input
                    value={focus}
                    onChange={(event) => setFocus(event.target.value)}
                  />
                </HeroField>
                <Button onClick={generate} disabled={generating}>
                  {generating ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <WandSparkles className="size-4" />
                  )}
                  {generating ? ui.generating || ui.generate : ui.generate}
                </Button>
              </div>

              <div className="flex min-h-[410px] flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {ui.result_title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyScript}
                    disabled={!script}
                  >
                    <Copy className="size-3.5" />
                    {ui.copy}
                  </Button>
                </div>
                <div className="bg-muted/45 flex-1 rounded-lg p-4">
                  <p className="text-sm leading-7 whitespace-pre-wrap">
                    {script || ui.empty}
                  </p>
                </div>
                <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
                  <Sparkles className="text-primary size-3.5" />
                  {ui.tip}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
