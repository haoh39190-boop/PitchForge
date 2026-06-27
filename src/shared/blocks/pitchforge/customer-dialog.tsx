'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
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
  type CommunicationChannel,
  type Customer,
  type CustomerStage,
} from '@/shared/lib/pitchforge';

export function CustomerDialog({
  open,
  onOpenChange,
  customer,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
  onCreated?: (customer: Customer) => void;
}) {
  const t = useTranslations('pitchforge');
  const { addCustomer, updateCustomer } = usePitchForge();
  const [name, setName] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [budget, setBudget] = useState('');
  const [stage, setStage] = useState<CustomerStage>('new_lead');
  const [channel, setChannel] = useState<CommunicationChannel>('phone');
  const [focus, setFocus] = useState('');
  const [objection, setObjection] = useState('');
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(customer?.name || '');
    setVehicle(customer?.vehicle_model || '');
    setBudget(customer?.budget || '');
    setStage(customer?.stage || 'new_lead');
    setChannel(customer?.current_channel || 'phone');
    setFocus(customer?.focus || '');
    setObjection(customer?.objection || '');
    setRemark(customer?.remark || '');
    setError('');
  }, [customer, open]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError(t('customers.form.nameRequired'));
      return;
    }

    if (customer) {
      updateCustomer(customer.id, {
        name: name.trim(),
        vehicle_model: vehicle.trim(),
        budget: budget.trim(),
        stage,
        current_channel: channel,
        focus: focus.trim(),
        objection: objection.trim(),
        remark: remark.trim(),
      });
      toast.success(t('customers.updated'));
    } else {
      const created = addCustomer({
        name: name.trim(),
        vehicle_model: vehicle.trim(),
        budget: budget.trim(),
      });
      onCreated?.(created);
      toast.success(t('customers.created'));
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {customer
              ? t('customers.form.editTitle')
              : t('customers.form.newTitle')}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? t('customers.form.editDescription')
              : t('customers.form.newDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <Field label={t('customers.form.name')}>
            <Input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError('');
              }}
              placeholder={t('customers.form.namePlaceholder')}
              autoFocus
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('customers.form.vehicle')}>
              <Input
                value={vehicle}
                onChange={(event) => setVehicle(event.target.value)}
                placeholder={t('customers.form.vehiclePlaceholder')}
              />
            </Field>
            <Field label={t('customers.form.budget')}>
              <Input
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder={t('customers.form.budgetPlaceholder')}
              />
            </Field>
          </div>

          {customer && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t('customers.form.stage')}>
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
                <Field label={t('customers.form.channel')}>
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
              <Field label={t('customers.form.focus')}>
                <Input
                  value={focus}
                  onChange={(event) => setFocus(event.target.value)}
                  placeholder={t('customers.form.focusPlaceholder')}
                />
              </Field>
              <Field label={t('customers.form.objection')}>
                <Input
                  value={objection}
                  onChange={(event) => setObjection(event.target.value)}
                  placeholder={t('customers.form.objectionPlaceholder')}
                />
              </Field>
              <Field label={t('customers.form.remark')}>
                <Textarea
                  value={remark}
                  onChange={(event) => setRemark(event.target.value)}
                  placeholder={t('customers.form.remarkPlaceholder')}
                  className="min-h-24 resize-none"
                />
              </Field>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit}>
            {customer ? t('common.save') : t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
