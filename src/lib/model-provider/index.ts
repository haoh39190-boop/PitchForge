import type { ModelProvider } from "./provider";
import type { ProviderType } from "./types";
import { DeepSeekModelProvider } from "./deepseek-provider";
import { MockModelProvider } from "./mock-provider";
import { TemplateModelProvider } from "./template-provider";

export function getConfiguredProviderType(): ProviderType {
  const providerType = process.env.MODEL_PROVIDER;

  if (providerType === "deepseek" || providerType === "mock" || providerType === "template") {
    return providerType;
  }

  return "template";
}

export function getModelProvider(
  providerType: ProviderType = getConfiguredProviderType()
): ModelProvider {
  if (providerType === "deepseek") {
    return new DeepSeekModelProvider();
  }

  if (providerType === "mock") {
    return new MockModelProvider();
  }

  return new TemplateModelProvider();
}

export type {
  ApiFailure,
  ApiResponse,
  ApiSuccess,
  GenerateScriptData,
  ProviderType,
  SalesScriptInput,
  SalesScriptOutput,
} from "./types";
