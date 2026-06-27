import type { CommunicationRecord, Customer, SavedScript } from './types';

export const STORAGE_KEYS = {
  customers: 'pitchforge_customers',
  records: 'pitchforge_communication_records',
  savedScripts: 'pitchforge_saved_scripts',
} as const;

function readCollection<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];

  try {
    const value = window.localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCollection<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readPitchForgeData() {
  return {
    customers: readCollection<Customer>(STORAGE_KEYS.customers),
    records: readCollection<CommunicationRecord>(STORAGE_KEYS.records),
    savedScripts: readCollection<SavedScript>(STORAGE_KEYS.savedScripts),
  };
}

export function persistCustomers(customers: Customer[]) {
  writeCollection(STORAGE_KEYS.customers, customers);
}

export function persistRecords(records: CommunicationRecord[]) {
  writeCollection(STORAGE_KEYS.records, records);
}

export function persistSavedScripts(savedScripts: SavedScript[]) {
  writeCollection(STORAGE_KEYS.savedScripts, savedScripts);
}

export function createLocalId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
