import { generateTemplateScript } from './template-provider';
import type { GenerationInput } from './types';

export * from './types';
export * from './storage';
export * from './prompt';
export * from './template-provider';
export * from './ai-client';

export function generateSalesScript(input: GenerationInput) {
  return generateTemplateScript(input);
}
