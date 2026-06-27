export const CUSTOMER_STAGES = [
  'new_lead',
  'following_up',
  'visit_scheduled',
  'negotiating',
  'won',
  'paused',
] as const;

export const COMMUNICATION_CHANNELS = [
  'phone',
  'wechat',
  'in_store',
  'other',
] as const;

export const SCRIPT_TONES = [
  'professional',
  'friendly',
  'conversion',
  'steady',
  'wechat',
  'phone_invite',
] as const;

export type CustomerStage = (typeof CUSTOMER_STAGES)[number];
export type CommunicationChannel = (typeof COMMUNICATION_CHANNELS)[number];
export type ScriptTone = (typeof SCRIPT_TONES)[number];
export type SourceType = 'generated' | 'saved_script';

export interface Customer {
  id: string;
  name: string;
  vehicle_model: string;
  budget: string;
  stage: CustomerStage;
  current_channel: CommunicationChannel;
  focus: string;
  objection: string;
  remark: string;
  created_at: string;
  updated_at: string;
  last_contacted_at: string;
}

export interface ScriptSections {
  opening: string;
  needsConfirmation: string;
  objectionHandling: string;
  nextStep: string;
  fullScript: string;
  salesReminder: string;
  providerType: 'template' | 'deepseek';
}

export interface GenerationInput {
  customer: Customer;
  stage: CustomerStage;
  channel: CommunicationChannel;
  focus: string;
  objection: string;
  tone: ScriptTone;
  extra_context: string;
  locale: string;
  variant?: number;
  instruction?: string;
}

export interface CommunicationRecord {
  id: string;
  customer_id: string;
  customer_name: string;
  vehicle_model: string;
  budget: string;
  stage: CustomerStage;
  channel: CommunicationChannel;
  focus: string;
  objection: string;
  tone: ScriptTone;
  extra_context: string;
  final_script: string;
  script_sections: ScriptSections;
  source_type: SourceType;
  created_at: string;
}

export interface SavedScript {
  id: string;
  title: string;
  content: string;
  stage: CustomerStage;
  channel: CommunicationChannel;
  objection: string;
  focus: string;
  vehicle_model: string;
  tone: ScriptTone;
  source_customer_id: string;
  source_record_id: string;
  created_at: string;
  updated_at: string;
}

export type CustomerDraft = Pick<Customer, 'name' | 'vehicle_model' | 'budget'>;
export type CustomerUpdate = Partial<
  Omit<Customer, 'id' | 'created_at' | 'updated_at'>
>;
