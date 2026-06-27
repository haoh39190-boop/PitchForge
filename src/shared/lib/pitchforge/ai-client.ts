import type { GenerationInput, ScriptSections } from './types';

interface GenerateResponse {
  data?: ScriptSections;
  error?: string;
}

export async function requestSalesScript(
  input: GenerationInput
): Promise<ScriptSections> {
  const response = await fetch('/api/pitchforge/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as GenerateResponse;

  if (!response.ok || !payload.data) {
    throw new Error(payload.error || 'Sales script generation failed');
  }

  return payload.data;
}
