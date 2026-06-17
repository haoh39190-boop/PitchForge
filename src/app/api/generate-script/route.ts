import { cleanClientId, invalidClientIdResponse } from "@/lib/api/client-id";
import {
  isValidClientId,
  saveScriptGeneration,
} from "@/lib/database/script-generations";
import {
  getConfiguredProviderType,
  getModelProvider,
  type ApiResponse,
  type GenerateScriptData,
  type SalesScriptInput,
} from "@/lib/model-provider";
import { ModelProviderError } from "@/lib/model-provider/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseInput(body: unknown): SalesScriptInput {
  const payload = typeof body === "object" && body !== null ? body : {};
  const source = payload as Record<string, unknown>;

  return {
    customerName: cleanString(source.customerName),
    vehicleModel: cleanString(source.vehicleModel),
    budget: cleanString(source.budget),
    customerStage: cleanString(source.customerStage),
    customerFocus: cleanString(source.customerFocus),
    customerObjection: cleanString(source.customerObjection),
    tone: cleanString(source.tone),
    customInfo: cleanString(source.customInfo),
  };
}

function validationError(message: string): Response {
  const response: ApiResponse<GenerateScriptData> = {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message,
    },
  };

  return Response.json(response, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = typeof body === "object" && body !== null ? body : {};
    const source = payload as Record<string, unknown>;
    const clientId = cleanClientId(source.clientId);
    const input = parseInput(body);

    if (!isValidClientId(clientId)) {
      return invalidClientIdResponse();
    }

    if (!input.vehicleModel) {
      return validationError("请填写车型名称。");
    }

    if (!input.customerStage) {
      return validationError("请选择客户阶段。");
    }

    if (!input.tone) {
      return validationError("请选择语气风格。");
    }

    const providerType = getConfiguredProviderType();
    const provider = getModelProvider(providerType);
    const output = await provider.generateSalesScript(input);
    const record = await saveScriptGeneration({
      clientId,
      input,
      output,
      providerType,
    });

    const response: ApiResponse<GenerateScriptData> = {
      success: true,
      data: {
        output,
        providerType,
        record,
      },
    };

    return Response.json(response);
  } catch (error) {
    if (error instanceof ModelProviderError) {
      const response: ApiResponse<GenerateScriptData> = {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      };

      return Response.json(response, { status: error.status });
    }

    const response: ApiResponse<GenerateScriptData> = {
      success: false,
      error: {
        code: "GENERATION_FAILED",
        message: "话术生成或保存失败，请稍后重试。",
      },
    };

    return Response.json(response, { status: 500 });
  }
}
