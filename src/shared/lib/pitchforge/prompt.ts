import type { GenerationInput } from './types';

export interface GenerationPlan {
  customerName: string;
  vehicle: string;
  budget: string;
  focus: string;
  objection: string;
  extraContext: string;
  isChinese: boolean;
  isBrief: boolean;
  isGentle: boolean;
  isDirect: boolean;
}

export function buildGenerationPlan(input: GenerationInput): GenerationPlan {
  const instruction = input.instruction?.trim().toLowerCase() || '';
  const isChinese = input.locale.startsWith('zh');

  return {
    customerName: input.customer.name.trim() || (isChinese ? '客户' : 'there'),
    vehicle:
      input.customer.vehicle_model.trim() ||
      (isChinese ? '意向车型' : 'your preferred model'),
    budget:
      input.customer.budget.trim() ||
      (isChinese ? '您的预算范围' : 'your budget range'),
    focus:
      input.focus.trim() ||
      (isChinese ? '实际用车需求' : 'your practical driving needs'),
    objection:
      input.objection.trim() ||
      (isChinese ? '目前仍在比较' : 'you are still comparing options'),
    extraContext: input.extra_context.trim(),
    isChinese,
    isBrief:
      instruction.includes('简短') ||
      instruction.includes('精简') ||
      instruction.includes('short'),
    isGentle:
      instruction.includes('委婉') ||
      instruction.includes('柔和') ||
      instruction.includes('gentle'),
    isDirect:
      instruction.includes('推进') ||
      instruction.includes('直接') ||
      instruction.includes('direct'),
  };
}
