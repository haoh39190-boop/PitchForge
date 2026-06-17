import type {
  ProviderType,
  SalesScriptInput,
  SalesScriptOutput,
} from "@/lib/model-provider";

export type ScriptGenerationRecord = {
  id: string;
  input: SalesScriptInput;
  output: SalesScriptOutput;
  providerType: ProviderType;
  isFavorite: boolean;
  createdAt: string;
};
