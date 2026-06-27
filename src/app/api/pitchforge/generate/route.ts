import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  buildSalesScriptUserPrompt,
  SALES_SCRIPT_SYSTEM_PROMPT,
} from '@/shared/lib/pitchforge/ai-prompt';
import type { ScriptSections } from '@/shared/lib/pitchforge/types';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitStore = new Map<
  string,
  {
    count: number;
    resetAt: number;
  }
>();

const requestSchema = z.object({
  customer: z.object({
    id: z.string().max(200),
    name: z.string().max(100),
    vehicle_model: z.string().max(200),
    budget: z.string().max(200),
    stage: z.enum([
      'new_lead',
      'following_up',
      'visit_scheduled',
      'negotiating',
      'won',
      'paused',
    ]),
    current_channel: z.enum(['phone', 'wechat', 'in_store', 'other']),
    focus: z.string().max(500),
    objection: z.string().max(500),
    remark: z.string().max(1000),
    created_at: z.string().max(100),
    updated_at: z.string().max(100),
    last_contacted_at: z.string().max(100),
  }),
  stage: z.enum([
    'new_lead',
    'following_up',
    'visit_scheduled',
    'negotiating',
    'won',
    'paused',
  ]),
  channel: z.enum(['phone', 'wechat', 'in_store', 'other']),
  focus: z.string().max(500),
  objection: z.string().max(500),
  tone: z.enum([
    'professional',
    'friendly',
    'conversion',
    'steady',
    'wechat',
    'phone_invite',
  ]),
  extra_context: z.string().max(1000),
  locale: z.string().max(20),
  variant: z.number().int().min(0).max(100).optional(),
  instruction: z.string().max(500).optional(),
});

const scriptSchema = z.object({
  opening: z.string().min(1).max(1000),
  needsConfirmation: z.string().min(1).max(1500),
  objectionHandling: z.string().min(1).max(1500),
  nextStep: z.string().min(1).max(1000),
  fullScript: z.string().min(1).max(4000),
  salesReminder: z.string().min(1).max(500),
});

interface DeepSeekResponse {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
  error?: {
    message?: string;
  };
}

type DeepSeekMessage = {
  role: 'user' | 'assistant';
  content: string;
};

function parseModelJson(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      throw new Error('The model returned an invalid response');
    }
    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

function isValidFullScriptLength(fullScript: string, locale: string) {
  if (locale.startsWith('zh')) {
    const length = fullScript.replace(/\s/g, '').length;
    return length >= 120 && length <= 200;
  }

  const words = fullScript.trim().split(/\s+/).filter(Boolean).length;
  return words >= 60 && words <= 180;
}

function clipChineseSentence(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, '').trim();
  if (normalized.length <= maxLength) return normalized;

  const clipped = normalized.slice(0, maxLength - 1);
  const sentenceEnd = Math.max(
    clipped.lastIndexOf('。'),
    clipped.lastIndexOf('！'),
    clipped.lastIndexOf('？')
  );

  if (sentenceEnd >= Math.floor(maxLength * 0.55)) {
    return clipped.slice(0, sentenceEnd + 1);
  }

  return `${clipped.replace(/[，。；、！？]+$/, '')}。`;
}

function normalizeScriptLength(
  script: z.infer<typeof scriptSchema>,
  locale: string
) {
  if (isValidFullScriptLength(script.fullScript, locale)) return script;

  if (locale.startsWith('zh')) {
    const sectionLimits = [28, 48, 65, 42];
    const sections = [
      script.opening,
      script.needsConfirmation,
      script.objectionHandling,
      script.nextStep,
    ];
    let fullScript = sections
      .map((section, index) =>
        clipChineseSentence(section, sectionLimits[index])
      )
      .join('');

    const additions = [
      '如果方便，我也可以按您的实际用车情况把相关重点整理清楚。',
      '您可以告诉我更合适的沟通时间，我们再继续确认。',
    ];
    for (const addition of additions) {
      if (fullScript.replace(/\s/g, '').length >= 120) break;
      fullScript += addition;
    }

    return {
      ...script,
      fullScript: clipChineseSentence(fullScript, 200),
    };
  }

  const sections = [
    script.opening,
    script.needsConfirmation,
    script.objectionHandling,
    script.nextStep,
  ].join(' ');
  let words = sections.trim().split(/\s+/).filter(Boolean);
  const additions = [
    'If it helps, I can prepare a simple comparison around the priorities you mentioned so our next conversation stays focused on what matters most to you.',
    'There is no need to decide immediately; the goal is to make the options easier to understand and agree on a useful next step.',
  ];

  for (const addition of additions) {
    if (words.length >= 60) break;
    words = words.concat(addition.split(/\s+/));
  }

  const fullScript = words
    .slice(0, 180)
    .join(' ')
    .replace(/[,:;]+$/, '.');

  return {
    ...script,
    fullScript,
  };
}

function isRateLimited(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const clientId =
    forwardedFor?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'local';
  const now = Date.now();
  const current = rateLimitStore.get(clientId);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

async function callDeepSeek({
  apiKey,
  baseUrl,
  model,
  messages,
  maxTokens = 900,
}: {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: DeepSeekMessage[];
  maxTokens?: number;
}) {
  const upstream = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: SALES_SCRIPT_SYSTEM_PROMPT,
      messages,
      temperature: 0.45,
      stream: false,
      thinking: {
        type: 'disabled',
      },
    }),
    signal: AbortSignal.timeout(45_000),
  });

  const response = (await upstream.json()) as DeepSeekResponse;
  if (!upstream.ok) {
    const error = new Error(
      response.error?.message || 'AI service request failed'
    );
    (error as Error & { status?: number }).status =
      upstream.status >= 500 ? 502 : upstream.status;
    throw error;
  }

  const text = response.content
    ?.filter((block) => block.type === 'text' && block.text)
    .map((block) => block.text)
    .join('\n');

  if (!text) {
    throw new Error('The model returned no text');
  }

  return scriptSchema.parse(parseModelJson(text));
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== new URL(request.url).host) {
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      );
    }

    if (isRateLimited(request)) {
      return NextResponse.json(
        { error: 'Too many generation requests' },
        { status: 429 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    const input = requestSchema.parse(await request.json());
    const baseUrl =
      process.env.DEEPSEEK_BASE_URL || 'https://direct.evolink.ai';
    const model = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';
    const userPrompt = buildSalesScriptUserPrompt(input);
    let parsed = await callDeepSeek({
      apiKey,
      baseUrl,
      model,
      messages: [{ role: 'user', content: userPrompt }],
    });

    if (!isValidFullScriptLength(parsed.fullScript, input.locale)) {
      const target = input.locale.startsWith('zh')
        ? '将 fullScript 严格压缩为 120–200 个汉字，保留客户关键信息、顾虑回应和明确下一步。'
        : 'Rewrite fullScript to exactly 90–150 words while retaining the customer context, concern response, and one clear next step.';

      parsed = await callDeepSeek({
        apiKey,
        baseUrl,
        model,
        maxTokens: 700,
        messages: [
          { role: 'user', content: userPrompt },
          { role: 'assistant', content: JSON.stringify(parsed) },
          {
            role: 'user',
            content: `${target} 同时保持相同 JSON 结构，只返回 JSON。`,
          },
        ],
      });
    }

    parsed = normalizeScriptLength(parsed, input.locale);

    if (!isValidFullScriptLength(parsed.fullScript, input.locale)) {
      throw new Error('The model could not meet the required script length');
    }

    const data: ScriptSections = {
      ...parsed,
      providerType: 'deepseek',
    };

    return NextResponse.json({ data });
  } catch (error) {
    const status =
      error instanceof Error && 'status' in error
        ? Number((error as Error & { status?: number }).status) || 500
        : 500;
    const message =
      error instanceof z.ZodError
        ? 'Invalid generation input or model response'
        : error instanceof Error
          ? error.message
          : 'Sales script generation failed';

    return NextResponse.json({ error: message }, { status });
  }
}
