'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  createLocalId,
  persistCustomers,
  persistRecords,
  persistSavedScripts,
  readPitchForgeData,
  type CommunicationRecord,
  type Customer,
  type CustomerDraft,
  type CustomerUpdate,
  type SavedScript,
} from '@/shared/lib/pitchforge';

interface PitchForgeContextValue {
  hydrated: boolean;
  customers: Customer[];
  records: CommunicationRecord[];
  savedScripts: SavedScript[];
  addCustomer: (draft: CustomerDraft) => Customer;
  addSampleCustomer: (locale: string) => Customer;
  updateCustomer: (id: string, update: CustomerUpdate) => void;
  deleteCustomer: (id: string) => void;
  addRecord: (record: Omit<CommunicationRecord, 'id' | 'created_at'>) => {
    record: CommunicationRecord;
    created: boolean;
  };
  deleteRecord: (id: string) => void;
  addSavedScript: (
    script: Omit<SavedScript, 'id' | 'created_at' | 'updated_at'>
  ) => SavedScript;
  updateSavedScript: (id: string, update: Partial<SavedScript>) => void;
  deleteSavedScript: (id: string) => void;
}

const PitchForgeContext = createContext<PitchForgeContextValue | null>(null);

export function PitchForgeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [records, setRecords] = useState<CommunicationRecord[]>([]);
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);

  useEffect(() => {
    const data = readPitchForgeData();
    setCustomers(data.customers);
    setRecords(data.records);
    setSavedScripts(data.savedScripts);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) persistCustomers(customers);
  }, [customers, hydrated]);

  useEffect(() => {
    if (hydrated) persistRecords(records);
  }, [records, hydrated]);

  useEffect(() => {
    if (hydrated) persistSavedScripts(savedScripts);
  }, [savedScripts, hydrated]);

  const addCustomer = useCallback((draft: CustomerDraft) => {
    const now = new Date().toISOString();
    const customer: Customer = {
      id: createLocalId('customer'),
      name: draft.name.trim(),
      vehicle_model: draft.vehicle_model.trim(),
      budget: draft.budget.trim(),
      stage: 'new_lead',
      current_channel: 'phone',
      focus: '',
      objection: '',
      remark: '',
      created_at: now,
      updated_at: now,
      last_contacted_at: '',
    };
    setCustomers((current) => [customer, ...current]);
    return customer;
  }, []);

  const addSampleCustomer = useCallback((locale: string) => {
    const now = new Date().toISOString();
    const isChinese = locale.startsWith('zh');
    const customer: Customer = {
      id: createLocalId('customer'),
      name: isChinese ? '李女士' : 'Emma Lee',
      vehicle_model: 'Model Y',
      budget: isChinese ? '30 万元左右' : 'Around $45,000',
      stage: 'visit_scheduled',
      current_channel: 'wechat',
      focus: isChinese
        ? '后排空间、日常通勤成本'
        : 'Rear-seat space and daily commuting cost',
      objection: isChinese
        ? '还在对比同级车型'
        : 'Still comparing similar models',
      remark: isChinese
        ? '周末时间更方便，希望先了解置换方案。'
        : 'Weekends are easier; wants trade-in information first.',
      created_at: now,
      updated_at: now,
      last_contacted_at: '',
    };
    setCustomers((current) => [customer, ...current]);
    return customer;
  }, []);

  const updateCustomer = useCallback((id: string, update: CustomerUpdate) => {
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === id
          ? {
              ...customer,
              ...update,
              updated_at: new Date().toISOString(),
            }
          : customer
      )
    );
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((current) => current.filter((customer) => customer.id !== id));
    setRecords((current) =>
      current.filter((record) => record.customer_id !== id)
    );
  }, []);

  const addRecord = useCallback(
    (draft: Omit<CommunicationRecord, 'id' | 'created_at'>) => {
      const duplicate = records.find(
        (record) =>
          record.customer_id === draft.customer_id &&
          record.final_script.trim() === draft.final_script.trim()
      );
      if (duplicate) return { record: duplicate, created: false };

      const record: CommunicationRecord = {
        ...draft,
        id: createLocalId('record'),
        created_at: new Date().toISOString(),
      };
      setRecords((current) => [record, ...current]);
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === record.customer_id
            ? {
                ...customer,
                stage: record.stage,
                current_channel: record.channel,
                focus: record.focus,
                objection: record.objection,
                last_contacted_at: record.created_at,
                updated_at: record.created_at,
              }
            : customer
        )
      );
      return { record, created: true };
    },
    [records]
  );

  const deleteRecord = useCallback((id: string) => {
    setRecords((current) => current.filter((record) => record.id !== id));
  }, []);

  const addSavedScript = useCallback(
    (draft: Omit<SavedScript, 'id' | 'created_at' | 'updated_at'>) => {
      const now = new Date().toISOString();
      const saved: SavedScript = {
        ...draft,
        id: createLocalId('script'),
        created_at: now,
        updated_at: now,
      };
      setSavedScripts((current) => [saved, ...current]);
      return saved;
    },
    []
  );

  const updateSavedScript = useCallback(
    (id: string, update: Partial<SavedScript>) => {
      setSavedScripts((current) =>
        current.map((script) =>
          script.id === id
            ? { ...script, ...update, updated_at: new Date().toISOString() }
            : script
        )
      );
    },
    []
  );

  const deleteSavedScript = useCallback((id: string) => {
    setSavedScripts((current) => current.filter((script) => script.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      customers,
      records,
      savedScripts,
      addCustomer,
      addSampleCustomer,
      updateCustomer,
      deleteCustomer,
      addRecord,
      deleteRecord,
      addSavedScript,
      updateSavedScript,
      deleteSavedScript,
    }),
    [
      hydrated,
      customers,
      records,
      savedScripts,
      addCustomer,
      addSampleCustomer,
      updateCustomer,
      deleteCustomer,
      addRecord,
      deleteRecord,
      addSavedScript,
      updateSavedScript,
      deleteSavedScript,
    ]
  );

  return (
    <PitchForgeContext.Provider value={value}>
      {children}
    </PitchForgeContext.Provider>
  );
}

export function usePitchForge() {
  const context = useContext(PitchForgeContext);
  if (!context) {
    throw new Error('usePitchForge must be used inside PitchForgeProvider');
  }
  return context;
}
