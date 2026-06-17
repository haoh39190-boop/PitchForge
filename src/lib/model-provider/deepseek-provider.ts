import { ModelProviderError } from "./errors";
import type { ModelProvider } from "./provider";
import type { SalesScriptInput, SalesScriptOutput } from "./types";

type DeepSeekContentBlock =
  | { type: "text"; text?: unknown }
  | { type: "thinking"; thinking?: unknown }
  | { type: "tool_use"; id?: unknown; name?: unknown; input?: unknown };

type DeepSeekResponse = {
  content?: DeepSeekContentBlock[];
  error?: {
    message?: string;
    type?: string;
  };
};

const outputKeys: Array<keyof SalesScriptOutput> = [
  "opening",
  "needsConfirmation",
  "valueMatching",
  "objectionHandling",
  "nextStep",
  "fullScript",
  "salesReminder",
];

const systemPrompt = `
你是 PitchForge 的汽车销售话术策略顾问。

你的任务：根据销售填写的结构化信息，生成可直接用于微信、电话或私域跟进的汽车销售沟通话术。

必须遵守：
1. 只输出严格 JSON，不要输出 Markdown、解释、代码块或多余文本。
2. JSON 必须包含且只包含这些字符串字段：
   opening, needsConfirmation, valueMatching, objectionHandling, nextStep, fullScript, salesReminder
3. 不得编造具体车型参数、官方指导价、优惠金额、库存、金融政策、交付周期。
4. 不得承诺“最低价”“一定通过贷款”“保证当天提车”等不确定内容。
5. 如果输入信息不足，用中性表达并提醒销售补充信息，不要乱编。
6. 话术要像真实销售能说出口，避免太书面。
7. 结构顺序遵循：先共情，再确认需求，再匹配价值，再处理异议，再推进下一步。
8. fullScript 要把前面几个模块整合成一段可复制完整话术。
9. salesReminder 要提醒销售避免虚假承诺，并说明涉及价格、库存、金融、交付时以门店实时信息为准。
`;

function getConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

  if (!apiKey) {
    throw new ModelProviderError(
      "模型服务未配置，请检查 DEEPSEEK_API_KEY。",
      "MODEL_PROVIDER_NOT_CONFIGURED",
      500
    );
  }

  return {
    apiKey,
    baseUrl: (process.env.DEEPSEEK_BASE_URL || "https://direct.evolink.ai").replace(
      /\/$/,
      ""
    ),
    model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
  };
}

function buildUserPrompt(input: SalesScriptInput) {
  return JSON.stringify(
    {
      task: "根据以下销售输入生成结构化汽车销售话术。",
      input: {
        customerName: input.customerName || "",
        vehicleModel: input.vehicleModel,
        budget: input.budget || "",
        customerStage: input.customerStage,
        customerFocus: input.customerFocus || "",
        customerObjection: input.customerObjection || "",
        tone: input.tone,
        customInfo: input.customInfo || "",
      },
      outputSchema: {
        opening: "开场回应",
        needsConfirmation: "需求确认",
        valueMatching: "价值匹配",
        objectionHandling: "异议处理",
        nextStep: "下一步推进",
        fullScript: "可复制完整话术",
        salesReminder: "销售提醒",
      },
    },
    null,
    2
  );
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function parseSalesScriptOutput(text: string): SalesScriptOutput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(extractJson(text));
  } catch {
    throw new ModelProviderError(
      "模型返回内容不是有效 JSON，请重试。",
      "MODEL_RESPONSE_INVALID_JSON",
      502
    );
  }

  if (!parsed || typeof parsed !== "object") {
    throw new ModelProviderError(
      "模型返回结构不符合要求。",
      "MODEL_RESPONSE_INVALID_SCHEMA",
      502
    );
  }

  const source = parsed as Record<string, unknown>;
  const missingKey = outputKeys.find((key) => typeof source[key] !== "string");

  if (missingKey) {
    throw new ModelProviderError(
      `模型返回缺少字段：${missingKey}。`,
      "MODEL_RESPONSE_INVALID_SCHEMA",
      502
    );
  }

  return {
    opening: source.opening as string,
    needsConfirmation: source.needsConfirmation as string,
    valueMatching: source.valueMatching as string,
    objectionHandling: source.objectionHandling as string,
    nextStep: source.nextStep as string,
    fullScript: source.fullScript as string,
    salesReminder: source.salesReminder as string,
  };
}

function extractText(response: DeepSeekResponse) {
  const text = response.content
    ?.filter((block) => block.type === "text")
    .map((block) => (typeof block.text === "string" ? block.text : ""))
    .join("\n")
    .trim();

  if (!text) {
    throw new ModelProviderError(
      "模型没有返回可解析的话术内容。",
      "MODEL_RESPONSE_EMPTY",
      502
    );
  }

  return text;
}

export class DeepSeekModelProvider implements ModelProvider {
  async generateSalesScript(input: SalesScriptInput): Promise<SalesScriptOutput> {
    const config = getConfig();
    const response = await fetch(`${config.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 1600,
        temperature: 0.3,
        thinking: { type: "disabled" },
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: buildUserPrompt(input),
          },
        ],
      }),
    });

    const rawText = await response.text();
    let payload: DeepSeekResponse;

    try {
      payload = rawText ? (JSON.parse(rawText) as DeepSeekResponse) : {};
    } catch {
      throw new ModelProviderError(
        "模型服务返回了无法解析的响应。",
        "MODEL_PROVIDER_BAD_RESPONSE",
        502
      );
    }

    if (!response.ok) {
      const upstreamMessage = payload.error?.message || "模型服务调用失败。";
      throw new ModelProviderError(
        upstreamMessage,
        "MODEL_PROVIDER_UPSTREAM_ERROR",
        response.status
      );
    }

    return parseSalesScriptOutput(extractText(payload));
  }
}
